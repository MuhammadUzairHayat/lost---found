# Lost & Found

Next.js app for posting lost/found items by category, raising **one hand** per post, and viewing all participants with **immediate contact** details. Black & white UI with subtle shape animations.

## Run locally

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

On Windows PowerShell, copy the example env file with `Copy-Item .env.example .env`. Adjust `DATABASE_URL` if your Postgres host, port, or credentials differ.

Open [http://localhost:3000](http://localhost:3000).

Until the app is wired to Prisma, posts and users still load from the JSON file store (`data/db.json`, `data/users.json`). Demo JSON seeds on first API use from `data/db.seed.json`.

## Features

- **Categories**: vehicles, electronics, documents, clothing, keys, pets, bags, other
- **Post types**: lost / found
- **Raise hand**: one per user per post; optional note
- **Participants panel**: poster + everyone who raised a hand; contact shown immediately
- **Profile**: account-based (name + phone/email/WhatsApp + preferred method)
- **Authentication**: home page is public; all other pages and APIs require sign-in (httpOnly session cookie)

## Demo account

- Email: `demo@example.com`
- Password: `demo123`

Set `AUTH_SECRET` in production (see `.env.example`).

## Database (PostgreSQL + Prisma)

| Command | Purpose |
| --- | --- |
| `npm run db:generate` | Regenerate Prisma Client after schema changes |
| `npm run db:push` | Sync schema to the database (no migration files) |
| `npm run db:seed` | Load demo data from `data/*.seed.json` |
| `npm run db:studio` | Open Prisma Studio |

Import the client in server code:

```ts
import { prisma } from "@/lib/prisma";
```

## Stack

- Next.js 15 App Router
- Tailwind CSS
- PostgreSQL + Prisma 7 (`prisma/schema.prisma`, connection in `prisma.config.ts`)
- JSON file store (`data/db.json`) — current runtime store until migrated
"# lost---found" 
