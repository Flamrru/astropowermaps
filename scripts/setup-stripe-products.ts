/**
 * Stripe Product Setup Script
 *
 * Creates subscription products and prices in Stripe for Stella+.
 * Supports both sandbox and live modes via STRIPE_MODE environment variable.
 *
 * Usage:
 *   npx tsx scripts/setup-stripe-products.ts           # Uses current STRIPE_MODE
 *   STRIPE_MODE=sandbox npx tsx scripts/setup-stripe-products.ts  # Force sandbox
 *   STRIPE_MODE=live npx tsx scripts/setup-stripe-products.ts     # Force live (requires confirmation)
 *
 * Prerequisites:
 *   - STRIPE_SECRET_KEY must match the mode (sk_test_... for sandbox, sk_live_... for live)
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";
import * as readline from "readline";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const STRIPE_MODE = process.env.STRIPE_MODE?.toLowerCase() || "sandbox";

// Get the correct key based on mode
// Supports both new dual-key system and legacy single-key system
function getSecretKey(): string | undefined {
  if (STRIPE_MODE === "live") {
    return process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
  }
  return process.env.STRIPE_SECRET_KEY_SANDBOX || process.env.STRIPE_SECRET_KEY;
}

const STRIPE_SECRET_KEY = getSecretKey();

if (!STRIPE_SECRET_KEY) {
  console.error("❌ Stripe secret key not found in environment variables");
  console.error("");
  console.error("   For sandbox mode, set one of these in .env.local:");
  console.error("     STRIPE_SECRET_KEY_SANDBOX=sk_test_...");
  console.error("     (or legacy) STRIPE_SECRET_KEY=sk_test_...");
  console.error("");
  console.error("   For live mode (STRIPE_MODE=live), set:");
  console.error("     STRIPE_SECRET_KEY_LIVE=sk_live_...");
  process.exit(1);
}

// Determine mode from key
const isLiveKey = STRIPE_SECRET_KEY.startsWith("sk_live_");
const isTestKey = STRIPE_SECRET_KEY.startsWith("sk_test_");
const keyMode = isLiveKey ? "live" : isTestKey ? "sandbox" : "unknown";

// Log current configuration
console.log("\n" + "=".repeat(60));
console.log("🔧 STRIPE SETUP CONFIGURATION");
console.log("=".repeat(60));
console.log(`   STRIPE_MODE env var: ${STRIPE_MODE}`);
console.log(`   Key type detected:   ${keyMode}`);
console.log(`   Key prefix:          ${STRIPE_SECRET_KEY.substring(0, 12)}...`);
console.log("=".repeat(60) + "\n");

// Validate key matches expected mode
if (STRIPE_MODE === "live" && !isLiveKey) {
  console.error("❌ STRIPE_MODE is 'live' but the key found is not a live key (sk_live_...)");
  console.error("   Set STRIPE_SECRET_KEY_LIVE=sk_live_... in .env.local");
  process.exit(1);
}

if (STRIPE_MODE === "sandbox" && !isTestKey) {
  console.error("❌ STRIPE_MODE is 'sandbox' but the key found is not a test key (sk_test_...)");
  console.error("   Set STRIPE_SECRET_KEY_SANDBOX=sk_test_... in .env.local");
  process.exit(1);
}

// Helper to prompt for confirmation
async function confirmLiveMode(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n⚠️  WARNING: You are about to create products in LIVE MODE");
    console.log("   This will create real products that can charge real money.\n");
    rl.question("   Type 'yes' to confirm: ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Main function to handle async operations
async function main() {
  // For live mode, require confirmation
  if (isLiveKey) {
    const confirmed = await confirmLiveMode();
    if (!confirmed) {
      console.log("\n❌ Cancelled. No products were created.");
      process.exit(0);
    }
    console.log("\n✅ Confirmed. Proceeding with LIVE mode...\n");
  }

  // Run the actual setup
  await setupStripeProducts();
  console.log("Done! Now update stripe-config.ts with the price IDs above.\n");
}

// Subscription pricing configuration
const MONTHLY_PRICE_CENTS = 1999; // $19.99/month after trial
const ONE_TIME_PRICE_CENTS = 1999; // $19.99 one-time (A/B test variant B)
const WINBACK_PRICE_CENTS = 999; // $9.99 one-time (winback offer for email leads)

const PLANS = [
  {
    name: "3-Day Trial",
    nickname: "stella_3day",
    trialPriceCents: 299, // $2.99
    trialDays: 3,
  },
  {
    name: "7-Day Trial",
    nickname: "stella_7day",
    trialPriceCents: 599, // $5.99
    trialDays: 7,
  },
  {
    name: "14-Day Trial",
    nickname: "stella_14day",
    trialPriceCents: 999, // $9.99
    trialDays: 14,
  },
];

async function setupStripeProducts() {
  console.log("\n🚀 Setting up Stripe products for Stella+...\n");

  try {
    // Step 1: Create (or find) the main product
    console.log("1️⃣  Creating Stella+ product...");

    // Check if product already exists
    const existingProducts = await stripe.products.list({
      limit: 100,
    });

    let product = existingProducts.data.find(
      (p) => p.metadata?.app === "astropowermaps" && p.metadata?.type === "stella_plus"
    );

    if (product) {
      console.log(`   ✓ Found existing product: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: "Stella+ Monthly",
        description: "Your personal AI astrologer. Get daily cosmic guidance, power day predictions, and deep chart insights.",
        metadata: {
          app: "astropowermaps",
          type: "stella_plus",
        },
      });
      console.log(`   ✓ Created product: ${product.id}`);
    }

    // Step 2: Create the recurring monthly price (base subscription)
    console.log("\n2️⃣  Creating monthly recurring price ($19.99/month)...");

    const existingPrices = await stripe.prices.list({
      product: product.id,
      limit: 100,
    });

    let monthlyPrice = existingPrices.data.find(
      (p) => p.recurring?.interval === "month" && p.unit_amount === MONTHLY_PRICE_CENTS
    );

    if (monthlyPrice) {
      console.log(`   ✓ Found existing monthly price: ${monthlyPrice.id}`);
    } else {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: MONTHLY_PRICE_CENTS,
        currency: "usd",
        recurring: {
          interval: "month",
        },
        metadata: {
          plan_type: "monthly_base",
        },
      });
      console.log(`   ✓ Created monthly price: ${monthlyPrice.id}`);
    }

    // Step 3: Create trial prices (one-time setup fees with trial days)
    console.log("\n3️⃣  Creating trial prices...\n");

    const priceIds: Record<string, string> = {
      monthly: monthlyPrice.id,
    };

    for (const plan of PLANS) {
      // Check if this trial price already exists
      let trialPrice = existingPrices.data.find(
        (p) => p.metadata?.nickname === plan.nickname && !p.recurring
      );

      if (trialPrice) {
        console.log(`   ✓ Found existing ${plan.name} price: ${trialPrice.id}`);
        priceIds[plan.nickname] = trialPrice.id;
      } else {
        // Create trial price as a one-time payment that triggers subscription
        // We'll use this with subscription mode + trial_period_days
        trialPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.trialPriceCents,
          currency: "usd",
          metadata: {
            nickname: plan.nickname,
            trial_days: plan.trialDays.toString(),
          },
        });
        console.log(`   ✓ Created ${plan.name} price: ${trialPrice.id} ($${(plan.trialPriceCents / 100).toFixed(2)})`);
        priceIds[plan.nickname] = trialPrice.id;
      }
    }

    // Step 4: Create one-time payment price (A/B test variant B)
    console.log("\n4️⃣  Creating one-time payment price ($19.99)...");

    let oneTimePrice = existingPrices.data.find(
      (p) => p.metadata?.nickname === "stella_one_time" && !p.recurring
    );

    if (oneTimePrice) {
      console.log(`   ✓ Found existing one-time price: ${oneTimePrice.id}`);
      priceIds.one_time = oneTimePrice.id;
    } else {
      oneTimePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: ONE_TIME_PRICE_CENTS,
        currency: "usd",
        metadata: {
          nickname: "stella_one_time",
          payment_type: "one_time",
          description: "One-time full access - A/B test variant B",
        },
      });
      console.log(`   ✓ Created one-time price: ${oneTimePrice.id} ($${(ONE_TIME_PRICE_CENTS / 100).toFixed(2)})`);
      priceIds.one_time = oneTimePrice.id;
    }

    // Step 5: Create winback offer price ($9.99 one-time for email leads)
    console.log("\n5️⃣  Creating winback offer price ($9.99)...");

    let winbackPrice = existingPrices.data.find(
      (p) => p.metadata?.nickname === "stella_winback" && !p.recurring
    );

    if (winbackPrice) {
      console.log(`   ✓ Found existing winback price: ${winbackPrice.id}`);
      priceIds.winback = winbackPrice.id;
    } else {
      winbackPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: WINBACK_PRICE_CENTS,
        currency: "usd",
        metadata: {
          nickname: "stella_winback",
          payment_type: "winback_offer",
          description: "Winback offer - email re-engagement ($9.99)",
        },
      });
      console.log(`   ✓ Created winback price: ${winbackPrice.id} ($${(WINBACK_PRICE_CENTS / 100).toFixed(2)})`);
      priceIds.winback = winbackPrice.id;
    }

    // Output results
    console.log("\n" + "=".repeat(60));
    console.log(`✅ SETUP COMPLETE! (${keyMode.toUpperCase()} MODE)`);
    console.log("=".repeat(60));

    // Show which config to update based on mode
    const configName = isLiveKey ? "LIVE_PRICES" : "SANDBOX_PRICES";
    console.log(`\n📋 Copy these IDs to src/lib/stripe-config.ts → ${configName}:\n`);
    console.log(`export const ${configName} = {`);
    console.log(`  PRODUCT_ID: "${product.id}",`);
    console.log(`  MONTHLY: "${priceIds.monthly}",`);
    console.log(`  TRIAL_3DAY: "${priceIds.stella_3day}",`);
    console.log(`  TRIAL_7DAY: "${priceIds.stella_7day}",`);
    console.log(`  TRIAL_14DAY: "${priceIds.stella_14day}",`);
    console.log(`  // One-time payment for A/B test variant B ($19.99)`);
    console.log(`  ONE_TIME: "${priceIds.one_time}",`);
    console.log(`  // Winback offer for email leads ($9.99)`);
    console.log(`  WINBACK: "${priceIds.winback}",`);
    console.log(`} as const;`);
    console.log("\n");

    // Remind about mode switching
    console.log("💡 To switch modes, set STRIPE_MODE in your .env.local:");
    console.log("   STRIPE_MODE=sandbox  → Uses test keys & SANDBOX_PRICES");
    console.log("   STRIPE_MODE=live     → Uses live keys & LIVE_PRICES");
    console.log("");

    // Return the IDs for programmatic use
    return {
      productId: product.id,
      priceIds,
    };
  } catch (error) {
    console.error("\n❌ Error setting up Stripe products:", error);
    throw error;
  }
}

// Run the setup
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
