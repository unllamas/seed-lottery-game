'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { motion } from '@/components/ui/motion';
import { SatoshiIcon } from '@/components/icon/satoshi';

import { SATOSHI_NUMBER_ADDRESS } from '@/lib/constant';
import { lightningConfig, siteConfig } from '@/config/site';
import LightningPaymentModal from './lightning-payment-modal';
import { generateLightningInvoice } from '@/actions/lightning-actions';

interface PaymentScreenProps {
  onPaymentComplete: () => void;
}

export default function PaymentScreen({ onPaymentComplete }: PaymentScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [verifyUrl, setVerifyUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Generar un invoice Lightning usando LUD-16
      const result = await generateLightningInvoice(
        lightningConfig?.lnaddress,
        lightningConfig?.amount,
        siteConfig?.name,
      );

      if (result.success) {
        setInvoice(result.invoice);
        setVerifyUrl(result.verifyUrl);
        setShowPaymentModal(true);
      } else {
        setError(result.error || 'Error al generar el invoice');
      }
    } catch (error) {
      console.error('Error al iniciar el pago:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onPaymentComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='w-full'
    >
      <div className='flex flex-col gap-2 py-6 text-center'>
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
          <h1 className='text-3xl font-semibold leading-none tracking-tight text-center text-white text-shadow'>
            {siteConfig?.name}
          </h1>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className='text-muted-foreground text-lg'>{siteConfig?.description}</p>
        </motion.div>
      </div>
      <div className='space-y-6'>
        <motion.div
          className='p-6 bg-orange-500/10 rounded-lg text-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className='text-lg font-medium text-orange-500 mb-2'>How does it work?</h3>
          <p className='text-sm mb-4'>
            Pay Satoshis and generate a random seed. If any of the first {SATOSHI_NUMBER_ADDRESS} addresses derived
            Native SegWit have a balance, you get everything inside!
          </p>
          <motion.div
            className='bg-card p-3 rounded-lg mb-4'
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <p className='text-sm font-medium text-muted-foreground'>Price per game:</p>
            <div className='flex items-center justify-center text-orange-500'>
              <SatoshiIcon className='size-6' />
              <p className='text-2xl font-bold'>{lightningConfig?.amount} SAT</p>
            </div>
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
                  Processing payment...
                </>
              ) : (
                <>
                  <Zap className='mr-2 h-5 w-5' />
                  Pay and Play
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
          <p>
            By
            <Button className='px-1 text-xs' variant='link' asChild>
              <Link href='https://x.com/unllamas'>@unllamas</Link>
            </Button>
            - All rights reserved
          </p>
        </motion.div>
      </div>

      <LightningPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={invoice}
        verifyUrl={verifyUrl}
        amount={lightningConfig?.amount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </motion.div>
  );
}
