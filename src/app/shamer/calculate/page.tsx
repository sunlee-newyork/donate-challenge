"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CalculatePage() {
  const router = useRouter();
  const { publicKey } = useWallet();

  const [pl, setPl] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) router.push("/");
  }, [publicKey, router]);

  const fetchPl = async () => {
    if (!publicKey) return;

    setLoading(true);

    const res = await fetch(`/api/pl?address=${publicKey?.toBase58()}`);
    const data = await res.json();
    const { pl } = data;
    setPl(pl);
    setLoading(false);
  }

  const title = !pl && !loading
    ? 'Calculate your losses'
    : pl
    ? `Your total loss is`
    : "Calculating your losses...";
  const description = !pl && !loading
    ? 'Click the button below to calculate your losses'
    : pl
    ? "See how many rounds of chemo you could have bought with your losses."
    : "We are calculating your losses...";

  return (
    <>
      <h1 className="text-3xl font-bold">{title}</h1>
      {pl && <p className="text-6xl font-bold">{pl}</p>}
      <p className="py-6">{description}</p>
      {!pl
        ? <button className="btn btn-primary" disabled={loading} onClick={fetchPl}>Calculate Losses</button>
        : <button className="btn btn-primary">Calculate Chemo</button>
      }
    </>
  );
}