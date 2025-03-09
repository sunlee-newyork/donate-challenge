'use client';

import { Wallet } from "@/app/_components/wallet";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1 justify-between">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Solana Donation Shamer</span>
            <img
              alt=""
              src="/donate-logo.svg"
              className="h-8 w-auto"
            />
          </Link>
          <Wallet />
        </div>
      </nav>
    </header>
  );
}