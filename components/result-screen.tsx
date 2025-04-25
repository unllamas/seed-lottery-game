'use client';

import { ExternalLink, RefreshCw, Trophy, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from '@/components/ui/motion';

interface ResultScreenProps {
  success: boolean;
  mnemonic: string;
  addressWithBalance?: {
    address: string;
    balance: number;
    index: number;
  };
  onPlayAgain: () => void;
}

export default function ResultScreen({ success, mnemonic, addressWithBalance, onPlayAgain }: ResultScreenProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='w-full'>
      <div>
        <div className='flex flex-col gap-2 py-6'>
          {success && (
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
              className='mb-4 mx-auto'
            >
              <Trophy className='h-12 w-12 text-green-500' />
            </motion.div>
          )}
          <h2
            className={`text-2xl font-semibold leading-none tracking-tight text-center ${
              success ? 'text-green-500' : 'text-orange-500'
            } text-shadow`}
          >
            {success ? '¡Felicitaciones!' : 'Suerte para la próxima'}
          </h2>
          <p className='text-sm text-muted-foreground text-center'>
            {success
              ? 'Has encontrado una dirección con balance'
              : 'No se encontró balance en ninguna de las direcciones'}
          </p>
        </div>
        <div className='space-y-6'>
          {success ? (
            <>
              <motion.div
                className='p-6 bg-green-500/10 rounded-lg flex flex-col items-center'
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className='text-center mb-4'>
                  <p className='text-green-500 font-medium'>¡Has ganado!</p>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                  >
                    <Badge className='bg-green-600 mt-2 text-lg py-1 px-3 glow-effect'>
                      {addressWithBalance?.balance} satoshis
                    </Badge>
                  </motion.div>
                </div>

                <div className='w-full mt-4'>
                  <motion.div
                    className='bg-card p-4 rounded-lg border border-green-500/20 mb-4'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <p className='text-sm font-medium text-muted-foreground mb-2'>Dirección con balance:</p>
                    <div className='flex items-center'>
                      <p className='font-mono text-xs break-all'>{addressWithBalance?.address}</p>
                      <a
                        href={`https://mempool.space/address/${addressWithBalance?.address}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='ml-2 text-blue-500 hover:text-blue-700'
                      >
                        <ExternalLink className='h-4 w-4' />
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    className='flex flex-col items-center'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  ></motion.div>
                </div>
              </motion.div>

              <motion.div
                className='p-4 bg-card/50 rounded-lg border border-border text-sm'
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <p className='font-medium mb-2 text-muted-foreground'>Tu semilla (guárdala en un lugar seguro):</p>
                <p className='font-mono text-xs break-all'>{mnemonic}</p>
              </motion.div>
            </>
          ) : (
            <motion.div
              className='p-6 bg-orange-500/10 rounded-lg flex flex-col items-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                  ease: 'easeInOut',
                }}
                className='mb-4'
              >
                <XCircle className='h-12 w-12 text-orange-500' />
              </motion.div>
              <motion.p
                className='text-center text-orange-500 font-medium mb-4'
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Balance no encontrado.
              </motion.p>
              <motion.p
                className='text-center text-sm text-white'
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                ¡Pero no te desanimes! Puedes intentarlo de nuevo con una nueva semilla.
              </motion.p>
            </motion.div>
          )}
        </div>
        <div className='flex items-center py-6'>
          <motion.div className='w-full' whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={onPlayAgain} className='w-full bg-orange-500 hover:bg-orange-600'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Jugar de nuevo
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
