'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, AlertCircle } from 'lucide-react';

import { verifyLightningPayment } from '@/actions/lightning-actions';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from '@/components/ui/motion';
import { SatoshiIcon } from '@/components/icon/satoshi';

interface LightningPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: string;
  verifyUrl?: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export default function LightningPaymentModal({
  isOpen,
  onClose,
  invoice,
  verifyUrl,
  amount,
  onPaymentSuccess,
}: LightningPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para copiar el invoice al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Función para verificar el estado del pago
  const checkPaymentStatus = async () => {
    if (!verifyUrl) return;

    try {
      setVerifying(true);
      const result = await verifyLightningPayment(verifyUrl);

      if (result.success && result.settled) {
        setPaymentStatus('success');
        clearInterval(intervalRef.current as NodeJS.Timeout);
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else if (!result.success) {
        setErrorMessage(result.error || 'Error al verificar el pago');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error verifying payment');
    } finally {
      setVerifying(false);
    }
  };

  // Iniciar la verificación periódica cuando se abre el modal y hay una URL de verificación
  useEffect(() => {
    if (isOpen && verifyUrl) {
      // Verificar inmediatamente
      checkPaymentStatus();

      // Configurar verificación periódica cada 3 segundos
      intervalRef.current = setInterval(checkPaymentStatus, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isOpen, verifyUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md'>
        {paymentStatus !== 'success' && (
          <DialogHeader>
            <DialogTitle className='text-center text-xl text-orange-500'>Lightning Payment</DialogTitle>
            <DialogDescription className='text-center'>Scan the QR code or copy the invoice to pay</DialogDescription>
          </DialogHeader>
        )}

        <div className='flex flex-col items-center space-y-4 p-4'>
          {paymentStatus === 'success' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='flex flex-col items-center space-y-4'
            >
              <div className='w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center'>
                <Check className='w-8 h-8 text-green-600 dark:text-green-400' />
              </div>
              <h3 className='text-lg font-medium text-green-600 dark:text-green-400'>Payment received!</h3>
              <p className='text-sm text-center text-muted-foreground'>
                Your payment has been processed successfully. Preparing your game...
              </p>
            </motion.div>
          ) : (
            <>
              <div className='bg-white p-4 rounded-lg'>
                <QRCodeSVG value={`lightning:${invoice}`} size={200} level='M' />
              </div>

              <div className='flex items-center justify-center text-orange-500'>
                <SatoshiIcon className='size-6' />
                <p className='text-2xl font-bold'>{amount} SAT</p>
              </div>

              <Card className='w-full p-3 bg-muted/50 relative overflow-hidden'>
                <div className='overflow-y-auto max-h-24 font-mono text-xs break-all'>{invoice}</div>
              </Card>
              <Button className='w-full' size='icon' variant='secondary' onClick={copyToClipboard} disabled={copied}>
                {copied ? (
                  <>
                    <Check className='h-4 w-4' />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className='h-4 w-4' /> Copy
                  </>
                )}
              </Button>

              {/* {verifying && (
                <div className='flex items-center text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Verificando pago...
                </div>
              )} */}

              {errorMessage && (
                <div className='flex items-center text-sm text-red-500'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  {errorMessage}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
