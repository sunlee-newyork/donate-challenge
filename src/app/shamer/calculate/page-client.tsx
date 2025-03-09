"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import cx from "classnames";

const CHEMO_COST = 2000000;

export default function CalculatePageClient() {
  const router = useRouter();
  const { publicKey } = useWallet();

  const [loading, setLoading] = useState(false);
  const [pl, setPl] = useState<number | null>(null);
  const [chemoRounds, setChemoRounds] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) router.push("/");
  }, [publicKey, router]);

  const fetchPl = async () => {
    if (!publicKey) return;

    setLoading(true);

    const res = await fetch(`/api/pl?address=${publicKey?.toBase58()}`);
    const data = await res.json();
    console.log("pl: ", data.pl);
    setPl(Number((data.pl / 100).toFixed(2)));
    setChemoRounds(Number((Math.abs(data.pl) / CHEMO_COST).toFixed(2)));
    setLoading(false);
  }

  const title = loading
    ? "Calculating your P&L..."
    : !pl
      ? "Calculate your P&L"
      : `Your total ${pl > 0 ? "profit" : "loss"} is`;

  const description = loading
    ? "We are calculating your P&L..."
    : !pl
      ? "Click the button below to calculate your P&L"
      : null;

  return (
    <>
      <h1 className="text-3xl font-bold">{title}</h1>
      {pl && (
        <p
          className={cx(
            "text-6xl font-bold",
            pl > 0 ? "text-green-500" : "text-red-500"
          )}
        >
          ${Math.abs(pl)}
        </p>
      )}
      <p className="py-6">{description}</p>
      {!pl && (
        <button
          className="btn btn-primary"
          disabled={loading}
          onClick={fetchPl}
        >
          Calculate Losses
        </button>
      )}
      {pl && (
        <div>
          <p>The average cost of chemotherapy is ${Number(CHEMO_COST / 100).toFixed(2)} USD.</p>
          <p>
            You could have paid for {chemoRounds} rounds of chemotherapy with
            your {pl > 0 ? "profits" : "losses"}.
          </p>
        </div>
      )}
    </>
  );
}