# Bugesera Stoneworks Ltd: website

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · shadcn/ui-style components · Route Handlers · Auth.js · PostgreSQL · Prisma 7 · Cloudinary · Flutterwave · Vercel

## What is in the site

| Area | Routes |
| --- | --- |
| Public pages | `/`, `/products`, `/process`, `/equipment`, `/market`, `/licensing`, `/investors`, `/about`, `/contact` |
| Quote requests with file upload | `/contact#quote` → `POST /api/quotes`, `POST /api/uploads/sign` |
| Accounts | `/register`, `/login`, `/account` |
| Paid orders | `/order` → `POST /api/orders` → Flutterwave checkout → `POST /api/payments/webhook` |
| Admin | `/admin` (quote status, prices, orders) |

All content comes from your business plan (`src/lib/content.ts`). **Placeholders to replace:** phone, email and WhatsApp number in `src/lib/content.ts`.

## Run locally

```bash
cp .env.example .env        # fill in values
npm install                 # also runs `prisma generate`
npm run db:push             # create tables
npm run db:seed             # products + first admin (uses ADMIN_EMAIL / ADMIN_PASSWORD)
npm run dev
```

Generate `AUTH_SECRET` with `npx auth secret`.

## Services to set up

1. **PostgreSQL**: Neon, Supabase, Railway or Vercel Postgres. Put the URL in `DATABASE_URL`.
2. **Cloudinary**: create a free account; copy cloud name, API key and secret. This is the recommended production storage for image uploads because serverless deployments often mount the filesystem read-only.
3. **Flutterwave**: create an account, enable Rwanda (RWF, MTN MoMo, Airtel Money, cards). Set the webhook URL to `https://YOUR-DOMAIN/api/payments/webhook` and the same secret hash in `FLUTTERWAVE_WEBHOOK_HASH`. Test in sandbox before going live.

## Deploy

```bash
git add -A && git commit -m "Initial site"
gh repo create bugesera-stoneworks --private --source=. --push
```

Import the repo on vercel.com, add every variable from `.env.example`, deploy, then run `npm run db:push && npm run db:seed` once against the production database.

## Notes

- Prices are not set. Add real RWF prices in `/admin`; only priced products can be ordered online, the rest go through quotes.
- Order totals are computed on the server from database prices, and payments are re-verified with Flutterwave before an order is marked paid.
- The financial section is deliberately empty of figures, matching the business plan: numbers should follow the geological survey.
- Quarry licensing (Law No. 072/2024, ESIA, rehabilitation guarantee) is summarised from the plan; confirm with RMB before relying on it.
