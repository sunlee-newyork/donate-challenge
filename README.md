This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install pnpm globally:

```bash
npm install -g pnpm
```

Install dependencies:

```bash
pnpm i
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying

All commits to the `main` branch will automatically deploy to Vercel.

## Services

- [Helius](https://helius.xyz/)
- [Birdeye](https://birdeye.so/)

## API

The API is built with [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/api-routes).

The API is located in the `src/app/api` directory.

## Notes

### Chemotherapy

My research concluded that the average cost of a single session of chemotherapy is extremely variable depending on type of cancer, stage, insurance, and other factors.

In the end, I decided to narrow down to breast cancer and use $15,000 per session from [this source](https://www.bankrate.com/credit-cards/news/average-cost-of-breast-cancer-treatment/#:~:text=Chemotherapy.%20%2412%2C618%20%E2%80%93%20%2417%2C564).

I initially searched for open source data from WHO and NCDB but couldn't find any public data.

It was also tricky to narrow it down to a single session because sources all vary in unit of measure, e.g. duration-based, total cost. Sometimes they also lumped drug costs, outpatient care, etc. into their numbers.

### P&L Calculation

I used the **Helius Enhanced Transactions API** to fetch the connected wallet's Jupiter Swap transactions, and **Birdeye Historical Price API** to fetch the token historical prices at the timestamp of the given transaction.

The app currently does not process all transactions (just the first 3 txs) for example purposes. Birdeye imposes a 1 request per second rate limit, so I capped the functionality just for this challenge.
