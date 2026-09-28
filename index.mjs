import path from 'node:path';

import {
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
} from 'discord.js';

import app from './src/app.mjs';

const REQUIRED_PARAMETERS = [
  'CHECK_INTERVAL',
  'DISCORD_CHANNEL_ID',
  'DISCORD_TOKEN',
  'FIR_PREFIX',
  'LAST_ATC_ONLINE_DATA_PATH',
];

// Permissions the bot needs in its channel
const REQUIRED_PERMISSIONS = ['ViewChannel', 'SendMessages'];

// An error nobody handled ends the process; systemd starts it again
process.on('unhandledRejection', (error) => {
  console.error('[ERROR] Unhandled rejection:', error);
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught exception:', error);
  process.exit(1);
});

// Load .env variables into process variables; those already set are kept
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`[ERROR] Unable to read .env file: ${e.message}`);
    process.exit(1);
  }
}

// Check if all parameters are present
const missingParameters = REQUIRED_PARAMETERS.filter((parameterName) => !process.env[parameterName]);
if (missingParameters.length > 0) {
  console.error(`[ERROR] Parameters missing in .env file: ${missingParameters.join(', ')}.`);
  process.exit(1);
}

const {
  CHECK_INTERVAL,
  DISCORD_CHANNEL_ID,
  DISCORD_TOKEN,
  FIR_PREFIX,
  LAST_ATC_ONLINE_DATA_PATH,
} = process.env;

const checkInterval = Number(CHECK_INTERVAL);
if (!Number.isInteger(checkInterval) || checkInterval < 1000) {
  console.error('[ERROR] Parameter \'CHECK_INTERVAL\' must be a number of milliseconds, 1000 at least.');
  process.exit(1);
}

// Create Discord client. It only posts to one channel, which needs no other intent.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in to Discord as ${readyClient.user.tag}.`);

  // Find the channel and check the bot may post to it, before it has anything to post
  let channel;
  try {
    channel = await readyClient.channels.fetch(DISCORD_CHANNEL_ID);
  } catch (e) {
    console.error(`[ERROR] Unable to find Discord channel ${DISCORD_CHANNEL_ID}: ${e.message}`);
    process.exit(1);
  }
  if (!channel?.isSendable()) {
    console.error(`[ERROR] Discord channel ${DISCORD_CHANNEL_ID} does not take messages.`);
    process.exit(1);
  }
  if (channel.guild) {
    const permissions = channel.permissionsFor(readyClient.user);
    const missingPermissions = REQUIRED_PERMISSIONS.filter(
      (permission) => !permissions?.has(PermissionFlagsBits[permission]),
    );
    if (missingPermissions.length > 0) {
      console.error(`[ERROR] The bot lacks ${missingPermissions.join(', ')} in #${channel.name}.`);
      process.exit(1);
    }
  }
  console.log(`Posting to #${channel.name}${channel.guild ? ` in ${channel.guild.name}` : ''}.`);

  // Run application with defined parameters
  await app(
    channel,
    {
      checkInterval,
      firPrefix: FIR_PREFIX,
      lastAtcOnlineDataPath: path.resolve(LAST_ATC_ONLINE_DATA_PATH),
    },
  );
});

// Login client into Discord server
try {
  await client.login(DISCORD_TOKEN);
} catch (e) {
  console.error(`[ERROR] Unable to log in to Discord: ${e.message}`);
  process.exit(1);
}
