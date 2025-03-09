"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLocalStorage } from "@/app/_hooks/useLocalStorage/useLocalStorage";

export default function CalculatePage() {
  const router = useRouter();
  const [storedPl, setStoredPl] = useLocalStorage("pl");
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) router.push("/");
  }, [publicKey, router]);

  useEffect(() => {
    // if (storedPl) return;
    if (!publicKey) return;
    fetch(`/api/pl?address=${publicKey?.toBase58()}`).then((res) => res.json()).then((data) => {
      const { pl } = data;
      setStoredPl(pl.toString());
    });
  }, [storedPl]);

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