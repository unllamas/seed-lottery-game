'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink } from 'lucide-react';
import { generateMultipleSegWitAddresses, checkAddressBalance } from '@/actions/crypto-actions';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SATOSHI_NUMBER_ADDRESS } from '../lib/constant';

interface DerivedAddressesProps {
  mnemonic: string;
}

interface AddressWithBalance {
  address: string;
  balance: number;
  index: number;
  isLoading: boolean;
  error?: string;
}

export default function DerivedAddresses({ mnemonic }: DerivedAddressesProps) {
  const [addresses, setAddresses] = useState<AddressWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<boolean>(false);
  const [activeAddressesCount, setActiveAddressesCount] = useState<number>(0);

  // Verificar automáticamente cuando cambia el mnemonic
  useEffect(() => {
    if (mnemonic) {
      checkAddresses();
    }
  }, [mnemonic]);

  const checkAddresses = async () => {
    if (!mnemonic) return;

    setIsLoading(true);
    setError(null);
    setApiError(false);
    setAddresses([]);
    setActiveAddressesCount(0);

    try {
      // Generar las primeras 30 direcciones
      const generatedAddresses = await generateMultipleSegWitAddresses(mnemonic, SATOSHI_NUMBER_ADDRESS);

      // Verificar el balance de cada dirección
      let activeCount = 0;
      const activeAddresses: AddressWithBalance[] = [];

      for (let i = 0; i < generatedAddresses.length; i++) {
        try {
          const balance = await checkAddressBalance(generatedAddresses[i]);

          // Solo añadir direcciones con actividad (balance > 0)
          if (balance > 0) {
            activeAddresses.push({
              address: generatedAddresses[i],
              balance,
              index: i,
              isLoading: false,
            });
            activeCount++;
          }

          // Pequeña pausa para evitar sobrecargar las APIs
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error al verificar el balance de la dirección ${i}:`, err);
          setApiError(true);
        }
      }

      setAddresses(activeAddresses);
      setActiveAddressesCount(activeCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verificando Direcciones</CardTitle>
          <CardDescription>Buscando actividad en las primeras 30 direcciones derivadas</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-orange-500 mb-4' />
          <p className='text-center text-sm text-gray-500'>
            Verificando balances y actividad en las direcciones derivadas...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant='default' className='bg-red-50 border-red-200'>
            <AlertCircle className='h-4 w-4 text-red-600' />
            <AlertTitle>Error al verificar direcciones</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (addresses.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Direcciones Verificadas</CardTitle>
          <CardDescription>No se encontró actividad en las primeras 30 direcciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='p-4 bg-gray-50 rounded-lg border text-center'>
            <p className='text-gray-500'>
              No se encontró ninguna dirección con balance o actividad en las primeras 30 derivaciones.
            </p>
          </div>
          {apiError && (
            <Alert variant='default' className='bg-amber-50 border-amber-200 mt-4'>
              <AlertCircle className='h-4 w-4 text-amber-600' />
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>
                Algunos balances pueden no mostrarse correctamente debido a limitaciones de las APIs.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direcciones con Actividad</CardTitle>
        <CardDescription>
          Se encontraron {addresses.length} direcciones con balance entre las primeras 30 derivaciones
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {apiError && (
          <Alert variant='default' className='bg-amber-50 border-amber-200'>
            <AlertCircle className='h-4 w-4 text-amber-600' />
            <AlertTitle>Advertencia</AlertTitle>
            <AlertDescription>
              Algunos balances pueden no mostrarse correctamente debido a limitaciones de las APIs.
            </AlertDescription>
          </Alert>
        )}

        <div className='space-y-2'>
          {addresses.map((item) => (
            <div
              key={item.index}
              className='p-3 bg-green-50 rounded-lg border border-green-200 flex justify-between items-center'
            >
              <div className='flex-1'>
                <div className='flex items-center'>
                  <span className='text-xs text-green-700 font-semibold mr-2'>#{item.index}</span>
                  <p className='font-mono text-sm break-all'>{item.address}</p>
                  <a
                    href={`https://mempool.space/address/${item.address}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='ml-2 text-blue-500 hover:text-blue-700'
                  >
                    <ExternalLink className='h-4 w-4' />
                  </a>
                </div>
                <div className='mt-1'>
                  <Badge className='bg-green-600'>{item.balance} satoshis</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
