'use client';

import { useState, useEffect } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from '@/components/ui/motion';
import { generateMultipleSegWitAddresses, checkAddressBalance } from '@/actions/crypto-actions';
import { SATOSHI_NUMBER_ADDRESS } from '../lib/constant';

interface ProgressScreenProps {
  mnemonic: string;
  onComplete: (hasBalance: boolean, addressWithBalance?: { address: string; balance: number; index: number }) => void;
}

export default function ProgressScreen({ mnemonic, onComplete }: ProgressScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Iniciando proceso...');
  const [progress, setProgress] = useState(0);
  const [addresses, setAddresses] = useState<string[]>([]);

  useEffect(() => {
    const verifyAddresses = async () => {
      try {
        // Paso 1: Generar semilla y mostrar mensajes iniciales
        const steps = [
          '🔐 Generando semilla aleatoria...',
          '📦 Derivando clave maestra...',
          '🔍 Generando dirección principal...',
          '🎯 Preparando verificación de direcciones...',
        ];

        for (let i = 0; i < steps.length; i++) {
          setCurrentStep(i);
          setStatusMessage(steps[i]);
          setProgress(Math.floor((i / (steps.length + 30)) * 100));
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Paso 2: Generar las 30 direcciones reales
        setStatusMessage('🔄 Generando direcciones Bitcoin...');
        const generatedAddresses = await generateMultipleSegWitAddresses(mnemonic, SATOSHI_NUMBER_ADDRESS);
        setAddresses(generatedAddresses);

        // Paso 3: Verificar el balance de cada dirección
        for (let i = 0; i < generatedAddresses.length; i++) {
          setCurrentStep(steps.length + i);
          setStatusMessage(`🔍 Verificando dirección #${i + 1}...`);
          setProgress(Math.floor(((steps.length + i) / (steps.length + 30)) * 100));

          // Verificar el balance real usando la función checkAddressBalance
          const balance = await checkAddressBalance(generatedAddresses[i]);

          // Si encontramos una dirección con balance, completamos el proceso
          if (balance > 0) {
            setStatusMessage(`✨ ¡Balance encontrado en dirección #${i + 1}!`);
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
        setStatusMessage('Verificación completa.');
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onComplete(false);
      } catch (error) {
        console.error('Error al verificar direcciones:', error);
        setStatusMessage('❌ Error al verificar direcciones. Inténtalo de nuevo.');
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
        <CardHeader>
          <CardTitle className='text-center text-orange-500 text-shadow'>Verificando Direcciones</CardTitle>
          <CardDescription className='text-center'>Buscando balance en las direcciones derivadas</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <motion.div
            className='flex flex-col items-center justify-center p-6 bg-orange-500/10 rounded-lg border border-orange-500/20'
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
              <p className='text-xs text-right mt-1 text-orange-400'>{progress}% completado</p>
            </div>
          </motion.div>

          {/* <motion.div
            className='p-4 bg-card/50 rounded-lg border border-border text-sm'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className='font-medium mb-2 text-muted-foreground'>Semilla generada:</p>
            <p className='font-mono text-xs break-all'>{mnemonic}</p>
          </motion.div> */}
        </CardContent>
      </div>
    </motion.div>
  );
}
