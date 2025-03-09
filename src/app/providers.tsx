"use client";

import dynamic from 'next/dynamic';

// Create a placeholder for the children
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Dynamically import the wallet components with SSR disabled
const WalletProviders = dynamic(
  () => import('./wallet-providers').then(mod => mod.default),
  { ssr: false }
);

// Export the main provider component
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClientOnly>
      <WalletProviders>{children}</WalletProviders>
    </ClientOnly>
  );
};
