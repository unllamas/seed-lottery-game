import BitcoinGame from '@/components/bitcoin-game';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background/80 to-background'>
      <div className='container'>
        <BitcoinGame />
      </div>
    </main>
  );
}
