'use server';

import * as bitcoin from 'bitcoinjs-lib';
import { mnemonicToSeedSync } from 'bip39';
import { HDKey } from '@scure/bip32';

/**
 * Server Action para generar múltiples direcciones Bitcoin Segwit Native (P2WPKH) a partir de una semilla mnemónica
 * @param mnemonic La semilla mnemónica (12, 15, 18, 21 o 24 palabras)
 * @param count El número de direcciones a generar
 * @returns Un array de direcciones Bitcoin Segwit Native
 */
export async function generateMultipleSegWitAddresses(mnemonic: string, count = 30): Promise<string[]> {
  try {
    // Convertir mnemónico a semilla
    const seed = mnemonicToSeedSync(mnemonic);

    // Derivar la clave raíz usando @scure/bip32
    const root = HDKey.fromMasterSeed(seed);

    // Generar múltiples direcciones
    const addresses: string[] = [];

    for (let i = 0; i < count; i++) {
      // Derivar la ruta para Segwit Native (BIP84): m/84'/0'/0'/0/i
      const path = `m/84'/0'/0'/0/${i}`;
      const child = root.derive(path);

      if (!child.publicKey) {
        throw new Error(`No se pudo derivar la clave pública para el índice ${i}`);
      }

      // Convertir Uint8Array a Buffer para compatibilidad con bitcoinjs-lib
      const pubkeyBuffer = Buffer.from(child.publicKey);

      // Generar la dirección P2WPKH (Segwit Native)
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: pubkeyBuffer,
        network: bitcoin.networks.bitcoin,
      });

      if (address) {
        addresses.push(address);
      }
    }

    return addresses;
  } catch (error) {
    console.error('Error al generar múltiples direcciones Segwit Native:', error);
    throw new Error(
      'No se pudieron generar las direcciones Bitcoin: ' + (error instanceof Error ? error.message : String(error)),
    );
  }
}

/**
 * Server Action para verificar el balance de una dirección Bitcoin
 * @param address La dirección Bitcoin a verificar
 * @returns El balance en satoshis
 */
export async function checkAddressBalance(address: string): Promise<number> {
  try {
    // Intentar con la API de Blockstream primero
    try {
      const response = await fetch(`https://blockstream.info/api/address/${address}`, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        // Blockstream devuelve chain_stats.funded_txo_sum - chain_stats.spent_txo_sum para el balance
        const chainStats = data.chain_stats || {};
        const fundedSum = chainStats.funded_txo_sum || 0;
        const spentSum = chainStats.spent_txo_sum || 0;
        return fundedSum - spentSum;
      }
    } catch (blockstreamError) {
      console.warn('Error con la API de Blockstream, intentando con alternativa:', blockstreamError);
    }

    // Intentar con la API de Mempool.space como alternativa
    try {
      const response = await fetch(`https://mempool.space/api/address/${address}`, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        // Mempool.space tiene una estructura similar a Blockstream
        const chainStats = data.chain_stats || {};
        const fundedSum = chainStats.funded_txo_sum || 0;
        const spentSum = chainStats.spent_txo_sum || 0;
        return fundedSum - spentSum;
      }
    } catch (mempoolError) {
      console.warn('Error con la API de Mempool.space, intentando con alternativa:', mempoolError);
    }

    // Si ambas APIs fallan, intentar con blockchain.info como último recurso
    const response = await fetch(`https://blockchain.info/q/addressbalance/${address}?cors=true`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Error al consultar el balance: ${response.statusText}`);
    }

    const balance = await response.text();
    return Number.parseInt(balance, 10);
  } catch (error) {
    console.error('Error al verificar el balance:', error);

    // En caso de error, devolver 0 en lugar de lanzar una excepción
    // Esto permite que la interfaz siga funcionando incluso si hay problemas con las APIs
    return 0;
  }
}
