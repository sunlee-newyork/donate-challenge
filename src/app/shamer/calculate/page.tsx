"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLocalStorage } from "@/app/_hooks/useLocalStorage/useLocalStorage";
import { getPL } from "@/app/_utils/pl";

export default function CalculatePage() {
  const [storedPl, setStoredPl] = useLocalStorage("pl");
  const { publicKey } = useWallet();

  useEffect(() => {
    if (storedPl || !publicKey) return;
    const pl = getPL(publicKey);
    setStoredPl(pl.toString());
  }, [storedPl, publicKey]);

  const title = storedPl ? `Your total loss is` : "Calculating your losses...";
  const description = storedPl ? "See how many rounds of chemo you could have bought with your losses." : "We are calculating your losses...";

  return (
    <>
      <h1 className="text-3xl font-bold">{title}</h1>
      {storedPl && <p className="text-6xl font-bold">{storedPl}</p>}
      <p className="py-6">{description}</p>
      <button className="btn btn-primary">Get Started</button>
    </>
  );
}