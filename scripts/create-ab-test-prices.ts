/**
 * A/B Test Price Creation Script
 *
 * Creates $24.99 and $29.99 one-time payment prices for A/B price testing.
 * Uses the same Stella+ product ID from stripe-config.ts.
 *
 * Usage:
 *   npx tsx scripts/create-ab-test-prices.ts           # Uses current STRIPE_MODE
 *   STRIPE_MODE=sandbox npx tsx scripts/create-ab-test-prices.ts  # Force sandbox
 *   STRIPE_MODE=live npx tsx scripts/create-ab-test-prices.ts     # Force live (requires confirmation)
 *
 * After running, copy the output price IDs to src/lib/stripe-config.ts
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";
import * as readline from "readline";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const STRIPE_MODE = process.env.STRIPE_MODE?.toLowerCase() || "sandbox";

// Get the correct key based on mode
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
console.log("🔧 A/B TEST PRICE CREATION");
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
    console.log("\n⚠️  WARNING: You are about to create prices in LIVE MODE");
    console.log("   This will create real products that can charge real money.\n");
    rl.question("   Type 'yes' to confirm: ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

// A/B test price configurations
const AB_TEST_PRICES = [
  {
    name: "$24.99 One-Time",
    nickname: "stella_one_time_24",
    priceCents: 2499,
    variantCode: "x24ts",
    configKey: "ONE_TIME_24",
  },
  {
    name: "$29.99 One-Time",
    nickname: "stella_one_time_29",
    priceCents: 2999,
    variantCode: "x29ts",
    configKey: "ONE_TIME_29",
  },
];

async function createABTestPrices() {
  console.log("\n🚀 Creating A/B test prices for Stella+...\n");

  try {
    // Step 1: Find the existing Stella+ product
    console.log("1️⃣  Finding Stella+ product...");

    const existingProducts = await stripe.products.list({
      limit: 100,
    });

    const product = existingProducts.data.find(
      (p) => p.metadata?.app === "astropowermaps" && p.metadata?.type === "stella_plus"
    );

    if (!product) {
      console.error("❌ Stella+ product not found. Run setup-stripe-products.ts first.");
      process.exit(1);
    }

    console.log(`   ✓ Found product: ${product.id}`);

    // Get existing prices
    const existingPrices = await stripe.prices.list({
      product: product.id,
      limit: 100,
    });

    // Step 2: Create A/B test prices
    console.log("\n2️⃣  Creating A/B test prices...\n");

    const priceIds: Record<string, string> = {};

    for (const priceConfig of AB_TEST_PRICES) {
      // Check if this price already exists
      let price = existingPrices.data.find(
        (p) => p.metadata?.nickname === priceConfig.nickname && !p.recurring
      );

      if (price) {
        console.log(`   ✓ Found existing ${priceConfig.name} price: ${price.id}`);
        priceIds[priceConfig.configKey] = price.id;
      } else {
        // Create new price
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceConfig.priceCents,
          currency: "usd",
          metadata: {
            nickname: priceConfig.nickname,
            payment_type: "one_time",
            variant_code: priceConfig.variantCode,
            description: `A/B price test - ${priceConfig.name}`,
          },
        });
        console.log(`   ✓ Created ${priceConfig.name} price: ${price.id}`);
        priceIds[priceConfig.configKey] = price.id;
      }
    }

    // Output results
    console.log("\n" + "=".repeat(60));
    console.log(`✅ A/B TEST PRICES CREATED! (${keyMode.toUpperCase()} MODE)`);
    console.log("=".repeat(60));

    // Show which config to update based on mode
    const configName = isLiveKey ? "LIVE_PRICES" : "SANDBOX_PRICES";
    console.log(`\n📋 Add these IDs to src/lib/stripe-config.ts → ${configName}:\n`);
    console.log(`// A/B test price variants`);
    console.log(`ONE_TIME_24: "${priceIds.ONE_TIME_24}", // $24.99 one-time (variant x24ts)`);
    console.log(`ONE_TIME_29: "${priceIds.ONE_TIME_29}", // $29.99 one-time (variant x29ts)`);
    console.log("\n");

    // URL codes reference
    console.log("📋 URL Codes Reference:");
    console.log("   ?c=x24ts → $24.99 (uses ONE_TIME_24)");
    console.log("   ?c=x29ts → $29.99 (uses ONE_TIME_29)");
    console.log("   (no param) → $19.99 (uses ONE_TIME)");
    console.log("\n");

    // Return the IDs for programmatic use
    return {
      productId: product.id,
      priceIds,
    };
  } catch (error) {
    console.error("\n❌ Error creating A/B test prices:", error);
    throw error;
  }
}

// Main function
async function main() {
  // For live mode, require confirmation
  if (isLiveKey) {
    const confirmed = await confirmLiveMode();
    if (!confirmed) {
      console.log("\n❌ Cancelled. No prices were created.");
      process.exit(0);
    }
    console.log("\n✅ Confirmed. Proceeding with LIVE mode...\n");
  }

  // Run the creation
  await createABTestPrices();
  console.log("Done! Update stripe-config.ts with the price IDs above.\n");
}

// Run the script
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
