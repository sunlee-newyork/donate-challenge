'use client';

import { Wallet } from "@/app/_components/wallet";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeClient() {
  const router = useRouter();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) router.push("/shamer/calculate");
  }, [publicKey, router]);

  return (
    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <div className="text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Solana Donation Shamer
        </h1>
        <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          How many rounds of Chemo treatment could you have paid for with your memecoin losses?
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Wallet />
          {publicKey && <Link href="/shamer/calculate" className="text-sm/6 font-semibold text-gray-900">
            Get Started <span aria-hidden="true">→</span>
          </Link>}
        </div>
      </div>
    </div>
  );
}
