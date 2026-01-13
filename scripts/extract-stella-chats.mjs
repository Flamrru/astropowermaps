/**
 * Extract Stella Chat Conversations from Supabase
 *
 * This script fetches all Stella AI chat messages and exports them
 * to a nicely formatted markdown file.
 *
 * Run with: node scripts/extract-stella-chats.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
config({ path: join(__dirname, '..', '.env.local') });

// Validate env vars
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables. Make sure .env.local has:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role (to access auth.users)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extractChats() {
  console.log('🔍 Fetching Stella chat messages...\n');

  // Query all messages with user emails
  // Using service role to access auth.users table
  const { data: messages, error } = await supabase
    .from('stella_messages')
    .select(`
      id,
      role,
      content,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: true });

  // Sort messages: by timestamp, then by role (user before assistant)
  // This ensures user prompts come before Stella's answers when they have the same timestamp
  messages.sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();

    // First sort by time
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // If same time, put 'user' before 'assistant'
    if (a.role === 'user' && b.role === 'assistant') return -1;
    if (a.role === 'assistant' && b.role === 'user') return 1;
    return 0;
  });

  if (error) {
    console.error('❌ Error fetching messages:', error.message);
    process.exit(1);
  }

  console.log(`✅ Found ${messages.length} messages\n`);

  if (messages.length === 0) {
    console.log('No chat messages found.');
    return;
  }

  // Get unique user IDs
  const userIds = [...new Set(messages.map(m => m.user_id))];
  console.log(`👥 Found ${userIds.length} users with chat history\n`);

  // Fetch user emails from auth.users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message);
    process.exit(1);
  }

  // Fetch user profiles to get display names
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('user_id, display_name');

  if (profilesError) {
    console.error('⚠️ Warning: Could not fetch user profiles:', profilesError.message);
  }

  // Create user ID to profile mapping
  const userProfileMap = {};
  if (profiles) {
    for (const profile of profiles) {
      userProfileMap[profile.user_id] = profile.display_name || null;
    }
  }

  // Create user ID to email mapping
  const userEmailMap = {};
  for (const user of users.users) {
    userEmailMap[user.id] = user.email || 'Unknown';
  }

  // Group messages by user (using user_id as key to preserve both email and name)
  const messagesByUser = {};
  for (const msg of messages) {
    const email = userEmailMap[msg.user_id] || 'Unknown';
    const displayName = userProfileMap[msg.user_id] || null;
    const userKey = msg.user_id; // Use user_id as key

    if (!messagesByUser[userKey]) {
      messagesByUser[userKey] = {
        email: email,
        displayName: displayName,
        messages: []
      };
    }
    messagesByUser[userKey].messages.push(msg);
  }

  // Format timestamp
  function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Build markdown content
  let markdown = `# Stella Chat Conversations\n\n`;
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
  markdown += `**Total Messages:** ${messages.length}\n`;
  markdown += `**Total Users:** ${userIds.length}\n\n`;
  markdown += `---\n\n`;

  // Sort users by display name (or email if no name)
  const sortedUserKeys = Object.keys(messagesByUser).sort((a, b) => {
    const nameA = messagesByUser[a].displayName || messagesByUser[a].email;
    const nameB = messagesByUser[b].displayName || messagesByUser[b].email;
    return nameA.localeCompare(nameB);
  });

  for (const userKey of sortedUserKeys) {
    const userData = messagesByUser[userKey];
    const { email, displayName, messages: userMessages } = userData;

    // Section header: show name and email
    if (displayName) {
      markdown += `## ${displayName}\n`;
      markdown += `📧 ${email}\n\n`;
    } else {
      markdown += `## ${email}\n\n`;
    }
    markdown += `*${userMessages.length} messages*\n\n`;

    // Determine what to call the user in messages
    const userName = displayName || email.split('@')[0] || 'User';

    for (const msg of userMessages) {
      const time = formatTime(msg.created_at);
      const sender = msg.role === 'user' ? `**${userName}**` : '**Stella**';

      // Escape content for markdown and add quote formatting
      const content = msg.content
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n');

      markdown += `${sender} *(${time})*:\n`;
      markdown += `${content}\n\n`;
    }

    markdown += `---\n\n`;
  }

  // Write to file
  const outputPath = 'stella-chats-export.md';
  writeFileSync(outputPath, markdown);

  console.log(`✅ Exported to ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - ${messages.length} total messages`);
  console.log(`   - ${userIds.length} users`);
  console.log(`   - Messages ordered chronologically (user prompt → Stella answer)`);
}

extractChats().catch(console.error);
