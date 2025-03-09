import { tryit } from "radash";
import { HeliusSwapTransaction } from "@/app/_types/helius";

export const getPL = tryit(async (address: string) => {
  const response = await fetch(
    `${process.env.HELIUS_API_HOST}v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}&source=JUPITER&type=SWAP`
  );

  const transactions = (await response.json()) as HeliusSwapTransaction[];

  for (const tx of transactions) {
    
  }

  const pl = 100;
  return pl;
});
