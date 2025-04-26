'use client';

import { ChevronDown, ChevronUp, ExternalLink, RefreshCw, Trophy, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from '@/components/ui/motion';
import { useState } from 'react';

interface ResultScreenProps {
  success: boolean;
  mnemonic: string;
  addressWithBalance?: {
    address: string;
    balance: number;
    index: number;
  };
  checkedAddresses?: string[]; // Lista de direcciones consultadas
  onPlayAgain: () => void;
}

export default function ResultScreen({
  success,
  mnemonic,
  addressWithBalance,
  checkedAddresses = [],
  onPlayAgain,
}: ResultScreenProps) {
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [expandedAddresses, setExpandedAddresses] = useState<Set<number>>(new Set());

  // Función para alternar la expansión de una dirección específica
  const toggleAddress = (index: number) => {
    const newExpanded = new Set(expandedAddresses);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAddresses(newExpanded);
  };

  // Determinar cuántas direcciones mostrar inicialmente
  const initialAddressCount = 5;
  const displayedAddresses = showAllAddresses ? checkedAddresses : checkedAddresses.slice(0, initialAddressCount);

  console.log('checkedAddresses', checkedAddresses);
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
            {success ? 'Congratulations!' : 'Good luck next time'}
          </h2>
          <p className='text-sm text-muted-foreground text-center'>
            {success ? 'You have found a balanced address' : 'No balance was found in either direction.'}
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
                  <p className='text-green-500 font-medium'>You have won!</p>
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
                    <p className='text-sm font-medium text-muted-foreground mb-2'>Balanced steering:</p>
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
                <p className='font-medium mb-2 text-muted-foreground'>Your seed (keep it in a safe place):</p>
                <p className='font-mono text-xs break-all'>{mnemonic}</p>
              </motion.div>
            </>
          ) : (
            <>
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
                  Balance not found.
                </motion.p>
                <motion.p
                  className='text-center text-sm text-white'
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  But don't be discouraged! You can try again with a new seed.
                </motion.p>
              </motion.div>

              {checkedAddresses?.length > 0 && (
                <motion.div
                  className='p-4 bg-card/50 rounded-lg border border-border'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className='flex justify-between items-center mb-3'>
                    <p className='font-medium text-sm text-muted-foreground'>Addresses consulted:</p>
                    <Badge variant='outline' className='text-xs'>
                      {checkedAddresses.length} addresses
                    </Badge>
                  </div>

                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {displayedAddresses?.map((address, index) => (
                      <div key={index} className='bg-background/50 rounded-md border border-border/50 overflow-hidden'>
                        <div
                          className='flex justify-between items-center p-2 cursor-pointer hover:bg-background/80'
                          onClick={() => toggleAddress(index)}
                        >
                          <div className='flex items-center'>
                            <span className='text-xs font-medium text-muted-foreground mr-2'>#{index}</span>
                            <span className='font-mono text-xs truncate max-w-[180px]'>{address}</span>
                          </div>
                          <div className='flex items-center'>
                            <a
                              href={`https://mempool.space/address/${address}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-500 hover:text-blue-700 mr-1'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className='h-3 w-3' />
                            </a>
                            {expandedAddresses.has(index) ? (
                              <ChevronUp className='h-4 w-4 text-muted-foreground' />
                            ) : (
                              <ChevronDown className='h-4 w-4 text-muted-foreground' />
                            )}
                          </div>
                        </div>

                        {expandedAddresses.has(index) && (
                          <div className='p-2 pt-0 border-t border-border/50'>
                            <p className='font-mono text-xs break-all'>{address}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {checkedAddresses.length > initialAddressCount && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full mt-2 text-xs'
                      onClick={() => setShowAllAddresses(!showAllAddresses)}
                    >
                      {showAllAddresses ? 'Show less' : `See all (${checkedAddresses.length})`}
                    </Button>
                  )}
                </motion.div>
              )}

              <motion.div
                className='p-4 bg-card/50 rounded-lg border border-border text-sm'
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p className='font-medium mb-2 text-muted-foreground'>Your seed:</p>
                <p className='font-mono text-xs break-all'>{mnemonic}</p>
              </motion.div>
            </>
          )}
        </div>
        <div className='flex items-center py-6'>
          <motion.div className='w-full' whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={onPlayAgain} className='w-full bg-orange-500 hover:bg-orange-600'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Play again
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
