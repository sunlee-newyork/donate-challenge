"use client";

import { useMemo } from "react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";
import { WalletError } from "@solana/wallet-adapter-base";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const wallets = useMemo( () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new LedgerWalletAdapter(),
  ], [] );

  const handleWalletError = ( e: WalletError ) => {
    console.error( 'Solana wallet error: ', e );
  }

  return (
    <WalletProvider
      wallets={ wallets }
      onError={ handleWalletError }
      autoConnect
    >
      <WalletDialogProvider>
        {children}
      </WalletDialogProvider>
    </WalletProvider>
  );
}
