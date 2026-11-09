# Deploy Maintena on Vercel

## 1. Import the repository

In Vercel, choose **Add New → Project**, import:

`Fr3dy03/Maintena`

The project is already configured as a Next.js App Router application. Keep the default settings:

- Framework preset: **Next.js**
- Root directory: `.`
- Build command: `next build`
- Install command: `npm install`
- Output directory: leave blank

## 2. Add a production PostgreSQL database

Use Vercel Postgres or another managed PostgreSQL provider. Add the provider's pooled connection string as `DATABASE_URL`. If the provider supplies a direct/unpooled connection string, add it as `DIRECT_URL` too.

Required environment variables for **Production, Preview, and Development**:

```text
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
CHAIN_PROOFS_ENABLED=false
BOT_PROOF_CHAIN_ID=968
BOT_PROOF_RPC_URL=https://rpc.bohr.life
BOT_PROOF_CONTRACT_ADDRESS=0x675F79CaF68d06dDD40C85Af14c6ac404265c874
```

Never add `BOT_TESTNET_PRIVATE_KEY` to Vercel for this MVP. The deployed UI does not need a private key; signing/deployment scripts run locally or in a separate protected worker.

## 3. Initialize the database

After adding `DATABASE_URL` locally, run:

```powershell
npm install
npx prisma validate
npx prisma db push
npm run db:seed
```

Use a migration workflow instead of `db push` before production schema changes. The Vercel build only runs `prisma generate` through the package `postinstall` script; it does not mutate your production database.

## 4. Deploy

Click **Deploy**. After deployment, verify:

- `/`
- `/app/overview`
- `/app/work-orders`
- `/m/today`
- `/m/scan`
- `/r/demo-public-kj-042`

## Current MVP limitations

- Authentication is not yet wired to an external identity provider.
- File uploads, email invites, PDF claim packets, and camera QR scanning need production adapters.
- BOT Chain proof anchoring is optional and not invoked by ordinary UI requests.
- Do not expose private keys or `.env.local` in Vercel environment variables.