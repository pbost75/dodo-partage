"use client";

import React from 'react';
import { Roboto_Slab, Lato } from 'next/font/google';

// Définition des polices identiques au funnel Dodomove
const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-slab',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-lato',
});

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${robotoSlab.variable} ${lato.variable}`}>
      {children}
    </div>
  );
} 