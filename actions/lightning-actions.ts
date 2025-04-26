'use server';

import { z } from 'zod';

// Esquema para validar la respuesta LUD-16
const lud16ResponseSchema = z.object({
  callback: z.string().url(),
  maxSendable: z.number(),
  minSendable: z.number(),
  metadata: z.string(),
  tag: z.literal('payRequest'),
});

// Esquema para validar la respuesta del callback - hacemos status opcional
const callbackResponseSchema = z.object({
  pr: z.string(),
  routes: z.array(z.any()).optional(),
  verify: z.string().url().optional(),
  status: z.enum(['OK', 'ERROR']).optional(), // Hacemos status opcional
  reason: z.string().optional(),
});

// Esquema para validar la respuesta de verificación
const verifyResponseSchema = z.object({
  status: z.enum(['OK', 'ERROR']).optional(), // Hacemos status opcional
  settled: z.boolean().optional(),
  preimage: z.string().nullable().optional(),
  pr: z.string().optional(),
  reason: z.string().optional(),
});

interface InvoiceData {
  invoice: string;
  verifyUrl?: string;
  success: boolean;
  error?: string;
}

interface PaymentStatus {
  settled: boolean;
  success: boolean;
  error?: string;
}

/**
 * Genera un invoice Lightning utilizando el estándar LUD-16
 * @param lightningAddress Dirección Lightning (formato: usuario@dominio)
 * @param amountSats Cantidad en satoshis
 * @param comment Comentario opcional para el pago
 * @returns Datos del invoice generado
 */
export async function generateLightningInvoice(
  lightningAddress: string,
  amountSats: number,
  comment?: string,
): Promise<InvoiceData> {
  try {
    // Validar la dirección Lightning
    const addressParts = lightningAddress.split('@');
    if (addressParts.length !== 2) {
      throw new Error('Formato de dirección Lightning inválido');
    }

    const [username, domain] = addressParts;

    // Construir la URL para la solicitud LUD-16
    const lud16Url = `https://${domain}/.well-known/lnurlp/${username}`;

    console.log('Solicitando LUD-16:', lud16Url);

    // Realizar la solicitud inicial LUD-16
    const lud16Response = await fetch(lud16Url, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!lud16Response.ok) {
      throw new Error(`Error al obtener datos LUD-16: ${lud16Response.statusText}`);
    }

    const lud16Data = await lud16Response.json();
    console.log('Respuesta LUD-16:', JSON.stringify(lud16Data, null, 2));

    // Validar la respuesta LUD-16
    const validatedLud16 = lud16ResponseSchema.parse(lud16Data);

    // Verificar que el monto esté dentro de los límites
    if (amountSats < validatedLud16.minSendable / 1000 || amountSats > validatedLud16.maxSendable / 1000) {
      throw new Error(
        `El monto debe estar entre ${validatedLud16.minSendable / 1000} y ${validatedLud16.maxSendable / 1000} sats`,
      );
    }

    // Construir la URL de callback con los parámetros necesarios
    const callbackUrl = new URL(validatedLud16.callback);
    callbackUrl.searchParams.append('amount', (amountSats * 1000).toString()); // Convertir a millisatoshis

    if (comment) {
      callbackUrl.searchParams.append('comment', comment);
    }

    console.log('Solicitando callback:', callbackUrl.toString());

    // Realizar la solicitud de callback para obtener el invoice
    const callbackResponse = await fetch(callbackUrl.toString(), {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!callbackResponse.ok) {
      throw new Error(`Error al generar invoice: ${callbackResponse.statusText}`);
    }

    const callbackData = await callbackResponse.json();
    console.log('Respuesta callback:', JSON.stringify(callbackData, null, 2));

    // Validar la respuesta del callback con manejo de errores más detallado
    try {
      const validatedCallback = callbackResponseSchema.parse(callbackData);

      // Verificar si hay un error explícito
      if (validatedCallback.status === 'ERROR') {
        throw new Error(validatedCallback.reason || 'Error desconocido al generar el invoice');
      }

      // Verificar que tengamos un invoice
      if (!validatedCallback.pr) {
        throw new Error('No se recibió un invoice válido en la respuesta');
      }

      return {
        invoice: validatedCallback.pr,
        verifyUrl: validatedCallback.verify,
        success: true,
      };
    } catch (validationError) {
      console.error('Error de validación:', validationError);

      // Intento alternativo: si hay un campo 'pr' en la respuesta, usarlo directamente
      if (callbackData && typeof callbackData === 'object' && 'pr' in callbackData) {
        return {
          invoice: callbackData.pr as string,
          verifyUrl: (callbackData.verify as string) || undefined,
          success: true,
        };
      }

      throw validationError;
    }
  } catch (error) {
    console.error('Error al generar invoice Lightning:', error);
    return {
      invoice: '',
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar el invoice',
    };
  }
}

/**
 * Verifica si un pago Lightning ha sido completado utilizando el estándar LUD-21
 * @param verifyUrl URL de verificación proporcionada en la respuesta del callback
 * @returns Estado del pago
 */
export async function verifyLightningPayment(verifyUrl: string): Promise<PaymentStatus> {
  try {
    console.log('Verificando pago en:', verifyUrl);

    // Realizar la solicitud de verificación
    const verifyResponse = await fetch(verifyUrl, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!verifyResponse.ok) {
      throw new Error(`Error al verificar pago: ${verifyResponse.statusText}`);
    }

    const verifyData = await verifyResponse.json();
    console.log('Respuesta verificación:', JSON.stringify(verifyData, null, 2));

    // Validar la respuesta de verificación con manejo de errores más flexible
    try {
      const validatedVerify = verifyResponseSchema.parse(verifyData);

      if (validatedVerify.status === 'ERROR') {
        throw new Error(validatedVerify.reason || 'Error desconocido al verificar el pago');
      }

      return {
        settled: validatedVerify.settled || false,
        success: true,
      };
    } catch (validationError) {
      console.error('Error de validación en verificación:', validationError);

      // Intento alternativo: si hay un campo 'settled' en la respuesta, usarlo directamente
      if (verifyData && typeof verifyData === 'object' && 'settled' in verifyData) {
        return {
          settled: Boolean(verifyData.settled),
          success: true,
        };
      }

      throw validationError;
    }
  } catch (error) {
    console.error('Error al verificar pago Lightning:', error);
    return {
      settled: false,
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al verificar el pago',
    };
  }
}
