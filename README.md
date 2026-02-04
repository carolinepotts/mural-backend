# Mural Backend

NestJS backend for the Mural coding challenge. It uses Supabase for the database and can receive MuralPay webhooks.

## Setup instructions

### Prerequisites

- **Node.js** (v18 or later recommended)
- **npm**

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables (already set up)

A `.env` file is committed in this repo to make reviewing easier. Obviously I would normally not commit this file!

### 3. Run the app

```bash
# Development (with watch)
npm run start:dev

# One-off run
npm run start
```

The API runs at **http://localhost:3000**.

---

## Documentation and testing the backend

### API base URL

- **Local:** http://localhost:3000
- **Production:** https://mural-backend.vercel.app

### Quick manual test (local)

With the app running (`npm run start:dev`):

```bash
# Health check
curl http://localhost:3000/

# List products
curl http://localhost:3000/products

# List orders
curl http://localhost:3000/orders
```

### Other files

The `scripts` folder contains commands that I ran locally to set up the MuralPay webhooks.

To test webhooks locally, update the url in `update-webhook.sh` to be an ngrok or localtunnel public URL pointing to your local version. Then run the `update-webhook.sh` script.

`docs/SUPABASE_SETUP.md` contains SQL that I ran in the SQL Editor in the Supabase UI to set up tables in the database. Typically I would have used an ORM like Drizzle or Prisma instead of doing manual table updates, but I skipped it for the sake of time.

---

## Current status

_(To be filled in: what is expected to work, and what is not yet working.)_

---

## Future work

_(To be filled in: improvements to make the backend more production ready.)_
