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
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const wallets = useMemo( () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new LedgerWalletAdapter(),
  ], [ WalletAdapterNetwork.Mainnet ] );

  const handleWalletError = ( e: WalletError ) => {
    console.error( 'Solana wallet error: ', e );
  }

  return (
    <WalletProvider
      wallets={ wallets }
      onError={ handleWalletError }
      autoConnect
    >
      <WalletDialogProvider sx={{
        '.MuiDialogTitle-root': {
          p: '1rem 1.5rem',
          color: ({ palette }) => palette.mode === 'light'
            ? palette.getContrastText( palette.secondary.main )
            : palette.text.secondary,
          bgcolor: ({ palette }) => palette.mode === 'light'
            ? palette.secondary.main
            : palette.secondary.main,
          '.MuiIconButton-root': {
            color: ({ palette }) => palette.mode === 'light'
              ? palette.getContrastText( palette.secondary.main )
              : palette.text.secondary,
          }
        },
        '.MuiList-root': {
          bgcolor: ({ palette }) => palette.background.paper + '!important',
          '.MuiListItem-root': {
            boxShadow: ({ palette }) => palette.mode === 'light'
              ? 'inset 0 1px 0 0 rgb(100,100,100,.1)'
              : 'inset 0 1px 0 0 rgb(255,255,255,.05)',
          }
        }
      }}>
        {children}
      </WalletDialogProvider>
    </WalletProvider>
  );
}
