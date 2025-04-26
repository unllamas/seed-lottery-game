'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from '@/components/ui/motion';

import { generateMultipleSegWitAddresses, checkAddressBalance } from '@/actions/crypto-actions';

import { SATOSHI_NUMBER_ADDRESS } from '@/lib/constant';

interface ProgressScreenProps {
  mnemonic: string;
  onComplete: (hasBalance: boolean, addressWithBalance?: { address: string; balance: number; index: number }) => void;
}

export default function ProgressScreen({ mnemonic, onComplete }: ProgressScreenProps) {
  const [statusMessage, setStatusMessage] = useState('Starting process...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const verifyAddresses = async () => {
      try {
        // Paso 1: Generar semilla y mostrar mensajes iniciales
        const steps = [
          '🔐 Generating random seed...',
          '📦 Deriving master key...',
          '🔍 Generating main address...',
          '🎯 Preparing address verification...',
        ];

        for (let i = 0; i < steps.length; i++) {
          setStatusMessage(steps[i]);
          setProgress(Math.floor((i / (steps.length + SATOSHI_NUMBER_ADDRESS)) * 100));
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Paso 2: Generar las SATOSHI_NUMBER_ADDRESS direcciones reales
        setStatusMessage('🔄 Generating Bitcoin addresses...');
        const generatedAddresses = await generateMultipleSegWitAddresses(mnemonic, SATOSHI_NUMBER_ADDRESS);

        // Paso 3: Verificar el balance de cada dirección
        for (let i = 0; i < generatedAddresses.length; i++) {
          setStatusMessage(`🔍 Verifying address #${i + 1}...`);
          setProgress(Math.floor(((steps.length + i) / (steps.length + SATOSHI_NUMBER_ADDRESS)) * 100));

          // Verificar el balance real usando la función checkAddressBalance
          const balance = await checkAddressBalance(generatedAddresses[i]);

          // Si encontramos una dirección con balance, completamos el proceso
          if (balance > 0) {
            setStatusMessage(`🔥 Balance found!`);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            onComplete(true, {
              address: generatedAddresses[i],
              balance: balance,
              index: i,
            });
            return;
          }

          // Pequeña pausa para evitar sobrecargar las APIs
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Si llegamos aquí, no se encontró balance en ninguna dirección
        setStatusMessage('Complete verification.');
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onComplete(false);
      } catch (error) {
        console.error('Error verifying addresses:', error);
        setStatusMessage('❌ Error verifying addresses. Please try again..');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onComplete(false);
      }
    };

    if (mnemonic) {
      verifyAddresses();
    }
  }, [mnemonic, onComplete]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='w-full max-w-md'>
      <div>
        <div className='flex flex-col gap-2 py-6'>
          <h2 className='text-2xl font-semibold leading-none tracking-tight text-center text-orange-500 text-shadow'>
            Verifying Addresses
          </h2>
          <p className='text-sm text-muted-foreground text-center'>Seeking balance in derived directions</p>
        </div>
        <div className='space-y-6 py-6'>
          <motion.div
            className='flex flex-col items-center justify-center p-6 bg-orange-500/10 rounded-lg'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
              className='mb-4'
            >
              <Loader2 className='h-12 w-12 text-orange-500' />
            </motion.div>

            <AnimatePresence mode='wait'>
              <motion.p
                key={statusMessage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className='text-center text-orange-500 font-medium mb-4'
              >
                {statusMessage}
              </motion.p>
            </AnimatePresence>

            <div className='w-full'>
              <div className='relative w-full'>
                <Progress value={progress} className='h-3 bg-orange-200/20 progress-shine' />
              </div>
              <p className='text-xs text-right mt-1 text-orange-400'>{progress}% filled</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
