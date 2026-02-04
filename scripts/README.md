# Scripts

## setup-webhook.sh

This script is for **setting up the webhook** with MuralPay’s staging API. It registers your webhook URL so MuralPay can send events (e.g. account balance activity, payout requests) to your app.

### Usage

Ensure `MURAL_API_KEY` is set in `.env` at the project root, then run from the project root:

```bash
chmod +x scripts/setup-webhook.sh
./scripts/setup-webhook.sh
```

The script POSTs to `https://api-staging.muralpay.com/api/webhooks` and subscribes to `MURAL_ACCOUNT_BALANCE_ACTIVITY` and `PAYOUT_REQUEST`. The webhook URL is hardcoded in the script.

## enable-webhook.sh

This script **enables** an existing webhook by setting its status to `ACTIVE` on MuralPay’s production API.

### Usage

Ensure `MURAL_API_KEY` is set in `.env` at the project root, then run from the project root:

```bash
chmod +x scripts/enable-webhook.sh
./scripts/enable-webhook.sh
```

The script PATCHes `https://api-staging.muralpay.com/api/webhooks/<webhookId>/status` with `{"status":"ACTIVE"}`. The webhook ID is hardcoded in the script.

## update-webhook.sh

This script **updates** an existing webhook’s URL on MuralPay’s production API (e.g. when your ngrok or public URL changes).

### Usage

Ensure `MURAL_API_KEY` is set in `.env` at the project root, then run from the project root:

```bash
chmod +x scripts/update-webhook.sh
./scripts/update-webhook.sh
```

The script PATCHes `https://api-staging.muralpay.com/api/webhooks/<webhookId>` with the new URL. The webhook ID and URL are hardcoded in the script.
