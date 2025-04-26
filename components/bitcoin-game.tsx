'use client';

import { useState } from 'react';
import { generateMnemonic } from 'bip39';

import PaymentScreen from '@/components/payment-screen';
import ProgressScreen from '@/components/progress-screen';
import ResultScreen from '@/components/result-screen';
import { AnimatePresence } from '@/components/ui/motion';
import { lightningConfig } from '@/config/site';

enum GameState {
  PAYMENT = 0,
  PROGRESS = 1,
  RESULT = 2,
}

interface AddressWithBalance {
  address: string;
  balance: number;
  index: number;
}

export default function BitcoinGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.PAYMENT);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [hasBalance, setHasBalance] = useState<boolean>(false);
  const [addressWithBalance, setAddressWithBalance] = useState<AddressWithBalance | undefined>(undefined);
  const [checkedAddresses, setCheckedAddresses] = useState<string[]>([]);

  // Número fijo de direcciones a verificar
  const addressCount = lightningConfig?.derivations;

  const handlePaymentComplete = () => {
    // Generar una nueva semilla aleatoria
    const newMnemonic = generateMnemonic(128); // 128 bits = 12 palabras
    setMnemonic(newMnemonic);
    setGameState(GameState.PROGRESS);
  };

  const handleProgressComplete = (foundBalance: boolean, foundAddress?: AddressWithBalance, addresses?: string[]) => {
    setHasBalance(foundBalance);
    setAddressWithBalance(foundAddress);
    setCheckedAddresses(addresses || []);
    setGameState(GameState.RESULT);
  };

  const handlePlayAgain = () => {
    setGameState(GameState.PAYMENT);
    setMnemonic('');
    setHasBalance(false);
    setAddressWithBalance(undefined);
    setCheckedAddresses([]);
  };

  return (
    <AnimatePresence mode='wait'>
      {gameState === GameState.PAYMENT && <PaymentScreen key='payment' onPaymentComplete={handlePaymentComplete} />}

      {gameState === GameState.PROGRESS && (
        <ProgressScreen
          key='progress'
          addressCount={addressCount}
          mnemonic={mnemonic}
          onComplete={handleProgressComplete}
        />
      )}

      {gameState === GameState.RESULT && (
        <ResultScreen
          key='result'
          success={hasBalance}
          mnemonic={mnemonic}
          addressWithBalance={addressWithBalance}
          checkedAddresses={checkedAddresses}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </AnimatePresence>
  );
}
