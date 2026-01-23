# To Run 
# chmod +x seed-cognito-users.sh
# ./seed-cognito-users.sh

#!/usr/bin/env bash
set -euo pipefail

# --------- CONFIG ----------
REGION="us-east-1"
USER_POOL_ID="us-east-1_XXXXXXXXX"   # <-- change this
PASSWORD="TestPassword123!"          # <-- change this (must meet your pool password policy)
OUT_FILE="seed-users.json"
EMAIL_DOMAIN="example.com"           # <-- change if you want
# ---------------------------

# Requires jq for JSON parsing
command -v jq >/dev/null 2>&1 || { echo "jq is required. Install jq first."; exit 1; }

echo "[]" > "$OUT_FILE"

for i in $(seq 1 20); do
  email="seeduser${i}@${EMAIL_DOMAIN}"
  username="seeduser${i}" 

  echo "Creating Cognito user: $email"

  # Create user (suppress welcome email)
  aws cognito-idp admin-create-user \
    --region "$REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username" \
    --user-attributes Name=email,Value="$email" Name=email_verified,Value=true \
    --message-action SUPPRESS >/dev/null

  # Set permanent password so you can log in immediately
  aws cognito-idp admin-set-user-password \
    --region "$REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username" \
    --password "$PASSWORD" \
    --permanent >/dev/null

  # Fetch the Cognito "sub"
  sub=$(aws cognito-idp admin-get-user \
    --region "$REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username" | jq -r '.UserAttributes[] | select(.Name=="sub") | .Value')

  # Append to JSON file
  tmp=$(mktemp)
  jq --arg email "$email" --arg sub "$sub" \
    '. + [{"email": $email, "sub": $sub}]' "$OUT_FILE" > "$tmp" && mv "$tmp" "$OUT_FILE"
done

echo "Done. Wrote $OUT_FILE"
echo "You can login with any seeded email and password: $PASSWORD"
