/**
 * Stripe Product Setup Script
 *
 * Run this script ONCE to create the subscription products and prices in Stripe.
 * It will output the price IDs that you need to add to subscription-plans.ts.
 *
 * Usage:
 *   npx tsx scripts/setup-stripe-products.ts
 *
 * Prerequisites:
 *   - STRIPE_SECRET_KEY environment variable must be set
 *   - Use your SANDBOX/TEST key (sk_test_...)
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY not found in environment variables");
  console.error("   Make sure .env.local contains STRIPE_SECRET_KEY=sk_test_...");
  process.exit(1);
}

// Verify we're using test/sandbox key
if (!STRIPE_SECRET_KEY.startsWith("sk_test_")) {
  console.error("❌ This script should only be run with SANDBOX keys (sk_test_...)");
  console.error("   Found key starting with:", STRIPE_SECRET_KEY.substring(0, 10));
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Subscription pricing configuration
const MONTHLY_PRICE_CENTS = 1999; // $19.99/month after trial

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

    // Output results
    console.log("\n" + "=".repeat(60));
    console.log("✅ SETUP COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Copy these price IDs to src/lib/subscription-plans.ts:\n");
    console.log(`export const STRIPE_PRICES = {`);
    console.log(`  PRODUCT_ID: "${product.id}",`);
    console.log(`  MONTHLY: "${priceIds.monthly}",`);
    console.log(`  TRIAL_3DAY: "${priceIds.stella_3day}",`);
    console.log(`  TRIAL_7DAY: "${priceIds.stella_7day}",`);
    console.log(`  TRIAL_14DAY: "${priceIds.stella_14day}",`);
    console.log(`} as const;`);
    console.log("\n");

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
setupStripeProducts()
  .then(() => {
    console.log("Done! Now update subscription-plans.ts with the price IDs above.\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
