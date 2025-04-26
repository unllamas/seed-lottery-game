import type React from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';

import { siteConfig } from '@/config/site';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: siteConfig?.name,
  description: siteConfig?.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es' suppressHydrationWarning>
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}`} />
        <Script id='google-analytics'>
          {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}');
      `}
        </Script>
      </head>
      <body className={`${inter.className} dark`}>
        <ThemeProvider defaultTheme='dark'>{children}</ThemeProvider>
      </body>
    </html>
  );
}
