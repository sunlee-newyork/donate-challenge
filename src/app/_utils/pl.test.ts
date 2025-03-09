import { getPL } from "./pl";
import * as helius from "@/app/_services/helius";
import * as birdeye from "@/app/_services/birdeye";

describe("pl.ts", () => {
  it("should calculate the pl", async () => {
    const mockTransactions = [
      {
        description: "test",
        type: "swap",
        source: "test",
        fee: 0,
        feePayer: "test",
        signature: "456",
        slot: 123,
        timestamp: 123,
        tokenTransfers: [],
        nativeTransfers: [],
        accountData: [],
        transactionError: null,
        instructions: [],
        events: {
          swap: {
            nativeInput: null,
            nativeOutput: {
              account: "test",
              amount: "50000000000",
            },
            tokenInputs: [
              {
                userAccount: "test",
                tokenAccount: "test",
                rawTokenAmount: {
                  tokenAmount: "80000",
                  decimals: 2,
                },
                mint: "some-token-mint",
              },
            ],
            tokenOutputs: [],
            nativeFees: [],
            tokenFees: [],
            innerSwaps: [],
          },
        },
      },
      {
        description: "test",
        type: "swap",
        source: "test",
        fee: 0,
        feePayer: "test",
        signature: "123",
        slot: 123,
        timestamp: 123,
        tokenTransfers: [],
        nativeTransfers: [],
        accountData: [],
        transactionError: null,
        instructions: [],
        events: {
          swap: {
            nativeInput: {
              account: "test",
              amount: "100000000000",
            },
            nativeOutput: null,
            tokenInputs: [],
            tokenOutputs: [
              {
                userAccount: "test",
                tokenAccount: "test",
                rawTokenAmount: {
                  tokenAmount: "80000",
                  decimals: 2,
                },
                mint: "some-token-mint",
              },
            ],
            nativeFees: [],
            tokenFees: [],
            innerSwaps: [],
          },
        },
      },
    ];
    const getTransactionsSpy = jest
      .spyOn(helius, "getTransactions")
      .mockReturnValue(Promise.resolve(mockTransactions));

    const getTokenPriceSpy = jest
      .spyOn(birdeye, "getTokenPrice")
      // first tx input token
      .mockReturnValueOnce(Promise.resolve(20))
      // first tx output token
      .mockReturnValueOnce(Promise.resolve(2.5))
      // second tx input token
      .mockReturnValueOnce(Promise.resolve(20))
      // second tx output token
      .mockReturnValueOnce(Promise.resolve(1.25));

    const pl = await getPL("some-address");
    // should be -$1000 (50% loss)
    expect(pl).toEqual([undefined, -100000]);

    getTokenPriceSpy.mockClear();
    getTransactionsSpy.mockClear();
  });
});
