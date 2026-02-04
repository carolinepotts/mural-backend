# Mural Backend

NestJS backend for the Mural coding challenge. It uses Supabase for the database and can receive MuralPay webhooks. It is deployed using Vercel.

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

Status against the project requirements (✓ = working, ✗ = not implemented because I ran out of time):

### Customer: Product Checkout & Payment Collection

- ✓ **Display a simple product catalog with items for sale** — GET `/products` returns the catalog.
- ✓ **Allow customers to shop for items** — Create an order from a product, including the wallet id the payment will come from. (Limitation: one product per order.)
- ✓ **Allow customers to complete checkout in USDC on Polygon** — Sending a payment to the Merchant's wallet (id hard-coded in webhooks) is detected; the matching order is marked paid. (Note: matching is by source wallet id + price only; see limitations below.)

### Merchant: Payment Receipt & Verification

- ✓ **Detect when a customer's payment has been received** — Webhook receives payment events and updates order status to paid.
- ✓ **Display payment status and confirmation to the merchant for their orders** — Merchant can poll GET `/orders` to see order (and thus payment) status.

### Merchant: Automatic Fund Conversion & Withdrawal

- ✗ **When payment is received, automatically initiate a conversion and transfer of funds to a bank account denominated in Colombian Pesos (COP)** — Not implemented.
- ✗ **A way for the Merchant to see the status of their withdrawals to COP** — Not implemented.

### Limitations (for items marked ✓)

- **Payment matching** — A payment is matched to an order by source wallet id and price only. This does not handle multiple orders from the same customer (same source wallet) with the same price; the wrong order could be marked paid.
- **One product per order** — Each order is for a single product. Supporting multiple products per order would be needed for a production app.
- **Unlimited quantities** — Products currently have unlimited quantity. Whether to add inventory/quantity limits depends on what the products represent in production _(e.g. limited physical product vs. unlimited digital file download)_.

### High-level thoughts on how I would implement the things that I ran out of time on:

- **When payment is received, automatically initiate a conversion and transfer of funds to a bank account denominated in Colombian Pesos (COP)**
  - After marking an order as paid in the webhook controller, call another function that makes a request to the Mural API to initial the transfer of funds. Save the withdrawal request in a new Supabase table with a status of `created`.
- **A way for the Merchant to see the status of their withdrawals to COP**
  - Update the webhook controller to handle `payout_status_changed` events. The webhook is already configured to be subscribed to these events. Find the matching withdrawal in Supabase (if this is an event about a withdrawal). Update the status in Supabase to match the status in the event.
  - Add an endpoint where the merchant can GET all withdrawals to see their current status.

### Seeing it in Action

End-to-end flow:

1. **Customer lists products** — The customer GETs `/products` to see the catalog.
2. **Customer creates an order** — The customer POSTs to `/orders` for one of those products, using the source wallet id as the "Customer Wallet" account in Mural (the wallet the customer will pay from).
3. **Customer pays in Mural** — In Mural, the customer sends the order price to the destination (merchant) wallet. _(This could also happen outside of Mural, but I was using Mural accounts for testing both the sender and the receiver.)_ This assumes the user knows which wallet address to send the payment to; the destination wallet address should probably be included in the POST `/orders` response so the customer knows where to pay, but it is currently not.
4. **Merchant sees order status change to paid** — The merchant polls GET `/orders` and sees the order status change to `paid` when the webhook has processed the payment.

---

## Future work

To make this API production-ready, I would:

- Improve payment matching (e.g. order ids, timestamps, or other disambiguation) so multiple orders from the same wallet at the same price are handled correctly.
- Support multiple products per order (line items / order contents).
- Decide on and implement product quantity/inventory if needed for production.
- Add the ability to add, update, and remove products from the catalog via the API (currently, you can only do this in the database itself)
- Add more fields to products, like a photo URL that links to S3 or Supabase storage
- Add rate limiting
- Improve error messages, input validation, and logging
- Add authentication, including differentiating between endpoints that customers can access vs. merchant admin-only access
- Pagination on get all requests (get all products, get all orders)
- Create separate environments (e.g. separate dev vs. prod databases)
- Consider whether Vercel is the right place to deploy the backend or not. This would be dependent on the team's existing infrastructure and the expected pattern & volume of requests.
