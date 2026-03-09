#!/bin/bash
# Creates all CollegeFind Stripe products & prices, updates .env.local.
# Usage: bash scripts/create-stripe-products.sh

set -euo pipefail

ENV_FILE=".env.local"

extract_id() {
  grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4
}

echo "Creating Stripe products and prices..."
echo ""

# ── 1. Student Pro ──────────────────────────────────────────────
echo "Creating Student Pro..."
STUDENT_PRO_PROD=$(stripe products create \
  --name="Student Pro" \
  --description="For seniors actively applying" | extract_id)

STUDENT_PRO_MONTHLY=$(stripe prices create \
  -d "product=$STUDENT_PRO_PROD" \
  -d "unit_amount=700" \
  -d "currency=usd" \
  -d "recurring[interval]=month" | extract_id)

STUDENT_PRO_YEARLY=$(stripe prices create \
  -d "product=$STUDENT_PRO_PROD" \
  -d "unit_amount=2900" \
  -d "currency=usd" \
  -d "recurring[interval]=year" | extract_id)

echo "  ✓ Product:  $STUDENT_PRO_PROD"
echo "  ✓ Monthly:  $STUDENT_PRO_MONTHLY"
echo "  ✓ Yearly:   $STUDENT_PRO_YEARLY"
echo ""

# ── 2. College Prep Pro+ ───────────────────────────────────────
echo "Creating College Prep Pro+..."
PREP_PRO_PROD=$(stripe products create \
  --name="College Prep Pro+" \
  --description="Full toolkit for serious applicants" | extract_id)

PREP_PRO_MONTHLY=$(stripe prices create \
  -d "product=$PREP_PRO_PROD" \
  -d "unit_amount=1200" \
  -d "currency=usd" \
  -d "recurring[interval]=month" | extract_id)

PREP_PRO_YEARLY=$(stripe prices create \
  -d "product=$PREP_PRO_PROD" \
  -d "unit_amount=4900" \
  -d "currency=usd" \
  -d "recurring[interval]=year" | extract_id)

echo "  ✓ Product:  $PREP_PRO_PROD"
echo "  ✓ Monthly:  $PREP_PRO_MONTHLY"
echo "  ✓ Yearly:   $PREP_PRO_YEARLY"
echo ""

# ── 3. College Application Toolkit ($19 one-time) ─────────────
echo "Creating Toolkit..."
TOOLKIT_PROD=$(stripe products create \
  --name="College Application Toolkit" \
  --description="Pay once — Pro features for 6 months" | extract_id)

TOOLKIT_PRICE=$(stripe prices create \
  -d "product=$TOOLKIT_PROD" \
  -d "unit_amount=1900" \
  -d "currency=usd" | extract_id)

echo "  ✓ Product:  $TOOLKIT_PROD"
echo "  ✓ Price:    $TOOLKIT_PRICE"
echo ""

# ── 4. College Application Bundle ($25 one-time) ──────────────
echo "Creating Bundle..."
BUNDLE_PROD=$(stripe products create \
  --name="College Application Bundle" \
  --description="Everything you need — one purchase" | extract_id)

BUNDLE_PRICE=$(stripe prices create \
  -d "product=$BUNDLE_PROD" \
  -d "unit_amount=2500" \
  -d "currency=usd" | extract_id)

echo "  ✓ Product:  $BUNDLE_PROD"
echo "  ✓ Price:    $BUNDLE_PRICE"
echo ""

# ── Update .env.local ──────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  sed -i '' "s|^STRIPE_PRICE_STUDENT_PRO_MONTHLY=.*|STRIPE_PRICE_STUDENT_PRO_MONTHLY=$STUDENT_PRO_MONTHLY|" "$ENV_FILE"
  sed -i '' "s|^STRIPE_PRICE_STUDENT_PRO_YEARLY=.*|STRIPE_PRICE_STUDENT_PRO_YEARLY=$STUDENT_PRO_YEARLY|" "$ENV_FILE"
  sed -i '' "s|^STRIPE_PRICE_PREP_PRO_PLUS_MONTHLY=.*|STRIPE_PRICE_PREP_PRO_PLUS_MONTHLY=$PREP_PRO_MONTHLY|" "$ENV_FILE"
  sed -i '' "s|^STRIPE_PRICE_PREP_PRO_PLUS_YEARLY=.*|STRIPE_PRICE_PREP_PRO_PLUS_YEARLY=$PREP_PRO_YEARLY|" "$ENV_FILE"
  sed -i '' "s|^STRIPE_PRICE_TOOLKIT=.*|STRIPE_PRICE_TOOLKIT=$TOOLKIT_PRICE|" "$ENV_FILE"
  sed -i '' "s|^STRIPE_PRICE_BUNDLE=.*|STRIPE_PRICE_BUNDLE=$BUNDLE_PRICE|" "$ENV_FILE"
  echo "✓ .env.local updated with all price IDs!"
else
  echo "⚠ .env.local not found"
fi

echo ""
echo "Done! Next steps:"
echo "  1. Add STRIPE_SECRET_KEY to .env.local"
echo "  2. Run: stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo "  3. Copy whsec_xxx → STRIPE_WEBHOOK_SECRET in .env.local"
echo "  4. Restart dev server"
