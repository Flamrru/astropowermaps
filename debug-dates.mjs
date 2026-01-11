import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  // Today's successful Stripe payments that should show
  const todayPayers = [
    'sarhcatlin@hotmail.com',
    'mindfulmarewellness@gmail.com',
    'lucy_whitworth@live.co.uk',
    'thereneeshupe@gmail.com',
    'erikaduffee@yahoo.com',
    'lafemmeheather@gmail.com',
    'cassandra.eve55@gmail.com',
    'lisa.jelly@hotmail.co.uk'
  ];

  console.log("=== LEAD CREATION vs PURCHASE DATE ===\n");
  console.log("Lithuanian time = UTC+2\n");

  for (const email of todayPayers) {
    // Get lead
    const { data: lead } = await supabase
      .from('astro_leads')
      .select('email, created_at')
      .ilike('email', email)
      .single();

    // Get purchase
    const { data: purchase } = await supabase
      .from('astro_purchases')
      .select('email, completed_at, status')
      .ilike('email', email)
      .eq('status', 'completed')
      .single();

    if (lead) {
      const leadUTC = new Date(lead.created_at);
      const leadLT = leadUTC.toLocaleString('en-US', { timeZone: 'Europe/Vilnius' });

      let purchaseLT = 'N/A';
      if (purchase?.completed_at) {
        const purchaseUTC = new Date(purchase.completed_at);
        purchaseLT = purchaseUTC.toLocaleString('en-US', { timeZone: 'Europe/Vilnius' });
      }

      console.log(email + ":");
      console.log("  Lead created (LT):    " + leadLT);
      console.log("  Purchase date (LT):   " + purchaseLT);

      // Check if lead date differs from purchase date
      if (purchase?.completed_at) {
        const leadDate = new Date(lead.created_at).toLocaleDateString('en-CA', { timeZone: 'Europe/Vilnius' });
        const purchaseDate = new Date(purchase.completed_at).toLocaleDateString('en-CA', { timeZone: 'Europe/Vilnius' });
        if (leadDate !== purchaseDate) {
          console.log("  ⚠️  DATES DIFFER! Lead: " + leadDate + ", Purchase: " + purchaseDate);
        }
      }
      console.log();
    }
  }
}

debug().catch(console.error);
