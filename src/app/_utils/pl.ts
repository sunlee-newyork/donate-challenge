import { tryit } from "radash";
import { getTokenPrice } from "@/app/_services/birdeye";
import { getTransactions } from "@/app/_services/helius";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const WSOL_MINT = "So11111111111111111111111111111111111111112";

type Asset = {
  mint: string;
  amount: number;
  value: number;
  price: number;
};

// TODO: add pagination for full transaction history fetch
export const getPL = tryit(async (address: string): Promise<number> => {
  const transactions = await getTransactions(address);
  if (!transactions) return 0;

  const txs = [...transactions].reverse().slice(0, 3);
  const holdings = new Map<string, number>();
  const costBasis = new Map<string, number>();
  let realizedPL = 0;

  // start from oldest tx
  for (const tx of txs) {
    console.log("Parsing tx: ", tx.signature);

    const { events, timestamp } = tx;
    const { swap } = events;
    const { nativeInput, nativeOutput, tokenInputs, tokenOutputs } = swap;

    const tokenInput = tokenInputs[0];
    const tokenOutput = tokenOutputs[0];

    // fetch historical prices for all assets involved in the tx
    const solPrice = await getTokenPrice(WSOL_MINT, timestamp);
    const inputTokenPrice = nativeInput
      ? solPrice
      : await getTokenPrice(tokenInput.mint, timestamp);
    const outputTokenPrice = nativeOutput
      ? solPrice
      : await getTokenPrice(tokenOutput.mint, timestamp);

    if (
      solPrice === false ||
      inputTokenPrice === false ||
      outputTokenPrice === false
    ) {
      console.error(`Failed to fetch prices for tx: ${tx.signature}`);
      continue;
    }

    // identify the input asset
    const input: Asset = nativeInput
      ? {
          mint: WSOL_MINT,
          amount: Number(nativeInput.amount) / LAMPORTS_PER_SOL,
          value: (Number(nativeInput.amount) / LAMPORTS_PER_SOL) * solPrice,
          price: solPrice,
        }
      : {
          mint: tokenInput.mint,
          amount:
            Number(tokenInput.rawTokenAmount.tokenAmount) /
            Math.pow(10, tokenInput.rawTokenAmount.decimals),
          value:
            (Number(tokenInput.rawTokenAmount.tokenAmount) /
              Math.pow(10, tokenInput.rawTokenAmount.decimals)) *
            inputTokenPrice,
          price: inputTokenPrice,
        };

    console.log(
      `Input: ${input.mint} amount: ${input.amount} value: ${input.value} price: ${input.price}`
    );

    // identify the output asset
    const output: Asset = nativeOutput
      ? {
          mint: WSOL_MINT,
          amount: Number(nativeOutput.amount) / LAMPORTS_PER_SOL,
          value: (Number(nativeOutput.amount) / LAMPORTS_PER_SOL) * solPrice,
          price: solPrice,
        }
      : {
          mint: tokenOutput.mint,
          amount:
            Number(tokenOutput.rawTokenAmount.tokenAmount) /
            Math.pow(10, tokenOutput.rawTokenAmount.decimals),
          value:
            (Number(tokenOutput.rawTokenAmount.tokenAmount) /
              Math.pow(10, tokenOutput.rawTokenAmount.decimals)) *
            outputTokenPrice,
          price: outputTokenPrice,
        };

    console.log(
      `Output: ${output.mint} amount: ${output.amount} value: ${output.value} price: ${output.price}`
    );

    // if the input asset is already in the holdings, we need to process the sale
    console.log(`Processing input token ${input.mint}...`);
    if (holdings.has(input.mint)) {
      const currentHolding = holdings.get(input.mint) || 0;
      const currentCostBasis = costBasis.get(input.mint) || 0;
      const costPerUnit =
        currentHolding > 0 ? currentCostBasis / currentHolding : 0;

      console.log(`Current holding: ${currentHolding}`);
      console.log(`Current cost basis: ${currentCostBasis}`);
      console.log(`Cost per unit: ${costPerUnit}`);

      const saleValue = input.amount * input.price;
      const costValue = input.amount * costPerUnit;
      realizedPL += saleValue - costValue;

      console.log(`Sale value: ${saleValue}`);
      console.log(`Cost value: ${costValue}`);
      console.log(`Realized PL: ${realizedPL}`);

      const newHolding = currentHolding - input.amount;
      const newCostBasis = costPerUnit * newHolding;

      console.log(`New holding: ${newHolding}`);
      console.log(`New cost basis: ${newCostBasis}`);

      holdings.set(input.mint, newHolding);
      costBasis.set(input.mint, newCostBasis);

      console.log(`Updated holdings: ${holdings.get(input.mint)}`);
      console.log(`Updated cost basis: ${costBasis.get(input.mint)}`);
    }

    // process the output asset
    console.log(`Processing output token ${output.mint}...`);
    const currentOutputHolding = holdings.get(output.mint) || 0;
    const currentOutputCostBasis = costBasis.get(output.mint) || 0;

    console.log(`Current output holding: ${currentOutputHolding}`);
    console.log(`Current output cost basis: ${currentOutputCostBasis}`);

    const newOutputHolding = currentOutputHolding + output.amount;
    const newOutputCostBasis =
      currentOutputCostBasis + output.amount * output.price;

    console.log(`New output holding: ${newOutputHolding}`);
    console.log(`New output cost basis: ${newOutputCostBasis}`);

    holdings.set(output.mint, newOutputHolding);
    costBasis.set(output.mint, newOutputCostBasis);

    console.log(`Updated holdings: ${holdings.get(output.mint)}`);
    console.log(`Updated cost basis: ${costBasis.get(output.mint)}`);
  }

  console.log(`Realized PL: ${realizedPL}`);

  return Math.round(realizedPL * 100);
});
