import { tryit } from "radash";
import { getTokenPrice } from "@/app/_services/birdeye";
import { getTransactions } from "@/app/_services/helius";

export const getPL = tryit(async (address: string) => {
  // sampling 3 txs for now
  const transactions = ((await getTransactions(address)) || []).slice(0, 3);

  let totalPL = 0;

  for (const tx of transactions) {
    console.log("Parsing tx: ", tx.signature);

    const { events, timestamp } = tx;
    const { swap } = events;
    const {
      nativeInput,
      nativeOutput,
      tokenInputs,
      tokenOutputs,
      nativeFees,
      tokenFees,
    } = swap;
    const tokenInput = tokenInputs[0];
    const tokenOutput = tokenOutputs[0];

    const solPrice = await getTokenPrice(
      "So11111111111111111111111111111111111111112",
      timestamp
    );
    // quick & dirty throttle for rate limit
    await new Promise((resolve) => setTimeout(resolve, 1001));

    const inputTokenPrice = nativeInput
      ? solPrice
      : await (async () => {
          // quick & dirty throttle for rate limit
          const price = await getTokenPrice(tokenInput.mint, timestamp);
          await new Promise((resolve) => setTimeout(resolve, 1001));
          return price;
        })();

    const outputTokenPrice = nativeOutput
      ? solPrice
      : await (async () => {
          // quick & dirty throttle for rate limit
          const price = await getTokenPrice(tokenOutput.mint, timestamp);
          await new Promise((resolve) => setTimeout(resolve, 1001));
          return price;
        })();

    if (
      solPrice === false ||
      inputTokenPrice === false ||
      outputTokenPrice === false
    ) {
      continue;
    }

    // Calculate input value in USD
    const inputValue = nativeInput
      ? (Number(nativeInput.amount) / 1e9) * inputTokenPrice
      : (Number(tokenInput.rawTokenAmount.tokenAmount) /
          Math.pow(10, tokenInput.rawTokenAmount.decimals)) *
        inputTokenPrice;

    // Calculate output value in USD
    const outputValue = nativeOutput
      ? (Number(nativeOutput.amount) / 1e9) * outputTokenPrice
      : (Number(tokenOutput.rawTokenAmount.tokenAmount) /
          Math.pow(10, tokenOutput.rawTokenAmount.decimals)) *
        outputTokenPrice;

    // Calculate fees in USD
    const nativeFeeValue = nativeFees.reduce((acc, fee) => {
      return acc + (Number(fee.amount) / 1e9) * solPrice;
    }, 0);

    const tokenFeeValue = tokenFees.reduce((acc, fee) => {
      const feePrice =
        fee.mint === "So11111111111111111111111111111111111111112"
          ? solPrice
          : outputTokenPrice;
      return (
        acc +
        (Number(fee.rawTokenAmount.tokenAmount) /
          Math.pow(10, fee.rawTokenAmount.decimals)) *
          feePrice
      );
    }, 0);

    // Calculate P&L for this transaction
    const transactionPL =
      outputValue - inputValue - nativeFeeValue - tokenFeeValue;
    totalPL += transactionPL;
  }

  // basis points
  return Math.round(totalPL * 100);
});
