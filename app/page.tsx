import BitcoinGame from '@/components/bitcoin-game';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background/80 to-background'>
      <div className='container'>
        <BitcoinGame />
      </div>
      {/* <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div> */}
      {/* <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-orange-500 mb-8 text-shadow">Bitcoin Telequino</h1>
      </div> */}
    </main>
  );
}
