export type BirdeyeTokenPrice = {
  success: boolean;
  data: {
    items: {
      unixTime: number;
      value: number;
    }[];
  };
};

export const getTokenPrice = async (
  address: string,
  timestamp: number
): Promise<number | false> => {
  const timeFrom = timestamp - 1000 * 60;
  const timeTo = timestamp + 1000 * 60;

  const url = `${process.env.BIRDEYE_API_HOST}defi/history_price?address=${address}&address_type=token&type=1m&time_from=${timeFrom}&time_to=${timeTo}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-chain": "solana",
      "X-API-KEY": process.env.BIRDEYE_API_KEY!,
    },
  });

  if (response.status !== 200) {
    console.error(
      `Response status ${response.status} for ${address} at ${timestamp}`
    );
    return false;
  }

  const data = (await response.json()) as BirdeyeTokenPrice;

  if (!data.success) {
    console.error(`Failed to fetch token price for ${address} at ${timestamp}`);
    return false;
  }

  if (!data.data.items.length) {
    console.error(`No data found for ${address} at ${timestamp}`);
    return false;
  }

  const price = data.data.items[0].value;

  if (price === 0) {
    console.error(`Token price is 0 for ${address} at ${timestamp}`);
    return false;
  }

  return price;
};
