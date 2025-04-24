'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, Info } from 'lucide-react';
import { motion } from '@/components/ui/motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SATOSHI_NUMBER_ADDRESS } from '../lib/constant';

interface PaymentScreenProps {
  onPaymentComplete: () => void;
}

export default function PaymentScreen({ onPaymentComplete }: PaymentScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);

    // Simulamos el proceso de pago (en un entorno real, esto se conectaría a Lightning Network)
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='w-full'
    >
      <div>
        <CardHeader className='text-center'>
          <motion.div className='float-effect'>
            <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg'>
              <Zap className='h-10 w-10 text-white' />
            </div>
          </motion.div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CardTitle className='text-3xl font-bold text-orange-500 text-shadow'>Bitcoin Telequino</CardTitle>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <CardDescription className='text-lg'>¡Descubrí si tu semilla es legendaria!</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <motion.div
            className='p-6 bg-orange-500/10 rounded-lg text-center'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className='text-lg font-medium text-orange-500 mb-2'>¿Cómo funciona?</h3>
            <p className='text-sm mb-4'>
              Paga 1,000 satoshis y genera una semilla aleatoria. Si alguna de las {SATOSHI_NUMBER_ADDRESS} primeras
              direcciones derivadas tiene balance, ¡te llevas todo lo que contenga!
            </p>
            <motion.div
              className='bg-card p-3 rounded-lg mb-4'
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <p className='text-sm font-medium text-muted-foreground'>Precio por juego:</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center justify-center'>
                      <p className='text-2xl font-bold text-orange-500'>1,000 satoshis</p>
                      <Info className='ml-2 h-4 w-4 text-muted-foreground' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Aproximadamente 0.30 USD</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className='w-full bg-orange-500 hover:bg-orange-600 glow-effect'
                size='lg'
              >
                {isProcessing ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <Zap className='mr-2 h-5 w-5' />
                    Pagar y Jugar
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className='text-xs text-center text-muted-foreground'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p>Al jugar, aceptas los términos y condiciones del servicio.</p>
            <p>La Crypta © 2023 - Todos los derechos reservados</p>
          </motion.div>
        </CardContent>
      </div>
    </motion.div>
  );
}
