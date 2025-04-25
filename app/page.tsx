import BitcoinGame from '@/components/bitcoin-game';

export default function Home() {
  return (
    <main className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background/80 to-background'>
      <div className='container'>
        <BitcoinGame />
      </div>
    </main>
  );
}
