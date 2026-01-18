/**
 * Extract NEW Stella Chat Conversations from Supabase
 *
 * Fetches messages AFTER January 13, 2026 (the last export date)
 *
 * Run with: node scripts/extract-new-stella-chats.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
config({ path: join(__dirname, '..', '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Last export was January 13, 2026 at 7:47:06 AM
const LAST_EXPORT_DATE = '2026-01-13T07:47:06Z';

async function extractNewChats() {
  console.log(`🔍 Fetching Stella messages after ${LAST_EXPORT_DATE}...\n`);

  // Paginate through all results (Supabase default limit is 1000)
  const PAGE_SIZE = 1000;
  let messages = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('stella_messages')
      .select('id, role, content, created_at, user_id')
      .gt('created_at', LAST_EXPORT_DATE)
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('❌ Error fetching messages:', error.message);
      process.exit(1);
    }

    messages = messages.concat(data);
    console.log(`   Fetched ${data.length} messages (total: ${messages.length})`);

    if (data.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      offset += PAGE_SIZE;
    }
  }

  // Sort: by timestamp, then user before assistant
  messages.sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    if (timeA !== timeB) return timeA - timeB;
    if (a.role === 'user' && b.role === 'assistant') return -1;
    if (a.role === 'assistant' && b.role === 'user') return 1;
    return 0;
  });

  console.log(`\n✅ Found ${messages.length} NEW messages\n`);

  if (messages.length === 0) {
    console.log('No new chat messages found since last export.');
    return;
  }

  // Get unique user IDs
  const userIds = [...new Set(messages.map(m => m.user_id))];
  console.log(`👥 Found ${userIds.length} users with new chat history\n`);

  // Fetch users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message);
    process.exit(1);
  }

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, display_name');

  const userProfileMap = {};
  if (profiles) {
    for (const profile of profiles) {
      userProfileMap[profile.user_id] = profile.display_name || null;
    }
  }

  const userEmailMap = {};
  for (const user of users.users) {
    userEmailMap[user.id] = user.email || 'Unknown';
  }

  // Group messages by user
  const messagesByUser = {};
  for (const msg of messages) {
    const email = userEmailMap[msg.user_id] || 'Unknown';
    const displayName = userProfileMap[msg.user_id] || null;
    const userKey = msg.user_id;

    if (!messagesByUser[userKey]) {
      messagesByUser[userKey] = { email, displayName, messages: [] };
    }
    messagesByUser[userKey].messages.push(msg);
  }

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

  // Build markdown
  let markdown = `# Stella Chat Conversations (New)\n\n`;
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
  markdown += `**Messages since:** ${new Date(LAST_EXPORT_DATE).toLocaleString()}\n`;
  markdown += `**Total New Messages:** ${messages.length}\n`;
  markdown += `**Total Users:** ${userIds.length}\n\n`;
  markdown += `---\n\n`;

  const sortedUserKeys = Object.keys(messagesByUser).sort((a, b) => {
    const nameA = messagesByUser[a].displayName || messagesByUser[a].email;
    const nameB = messagesByUser[b].displayName || messagesByUser[b].email;
    return nameA.localeCompare(nameB);
  });

  for (const userKey of sortedUserKeys) {
    const { email, displayName, messages: userMessages } = messagesByUser[userKey];

    if (displayName) {
      markdown += `## ${displayName}\n`;
      markdown += `📧 ${email}\n\n`;
    } else {
      markdown += `## ${email}\n\n`;
    }
    markdown += `*${userMessages.length} messages*\n\n`;

    const userName = displayName || email.split('@')[0] || 'User';

    for (const msg of userMessages) {
      const time = formatTime(msg.created_at);
      const sender = msg.role === 'user' ? `**${userName}**` : '**Stella**';
      const content = msg.content
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n');

      markdown += `${sender} *(${time})*:\n`;
      markdown += `${content}\n\n`;
    }

    markdown += `---\n\n`;
  }

  const outputPath = 'stella-chats-export-2.md';
  writeFileSync(outputPath, markdown);

  console.log(`✅ Exported to ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - ${messages.length} new messages`);
  console.log(`   - ${userIds.length} users`);
}

extractNewChats().catch(console.error);
