#!/usr/bin/env bash
set -e

# Load .env from project root if present
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

if [ -z "${MURAL_API_KEY:-}" ]; then
  echo "Error: MURAL_API_KEY is not set in .env"
  exit 1
fi

echo "Registering webhook..."

curl --request POST \
  --url "https://api-staging.muralpay.com/api/webhooks" \
  --header "accept: application/json" \
  --header "authorization: Bearer $MURAL_API_KEY" \
  --header "content-type: application/json" \
  --data '{
  "categories": [
    "MURAL_ACCOUNT_BALANCE_ACTIVITY",
    "PAYOUT_REQUEST"
  ],
  "url": "https://95cfcc41ed90.ngrok-free.app"
}'

echo ""
