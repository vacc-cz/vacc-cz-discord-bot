import { Client } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import app from './src/app.mjs';

// Load .env variables into process variables
dotenv.config();

// Check if all parameters are present in .env file
['CHECK_INTERVAL', 'DISCORD_CHANNEL_ID', 'DISCORD_TOKEN', 'FIR_PREFIX', 'LAST_ATC_ONLINE_DATA_PATH'].forEach((parameterName) => {
  if (process.env[parameterName] == null) {
    console.error(`[ERROR] Parameter '${parameterName}' is missing in .env file.`);
    process.exit(1);
  }
});

const {
  CHECK_INTERVAL,
  DISCORD_CHANNEL_ID,
  DISCORD_TOKEN,
  FIR_PREFIX,
  LAST_ATC_ONLINE_DATA_PATH,
} = process.env;

// Create Discord client
const client = new Client();

client.on('ready', async () => {
  // Run application with defined parameters
  await app(
    client,
    {
      checkInterval: CHECK_INTERVAL,
      discordChannelId: DISCORD_CHANNEL_ID,
      firPrefix: FIR_PREFIX,
      lastAtcOnlineDataPath: path.resolve(LAST_ATC_ONLINE_DATA_PATH),
    },
  );
});

// Login client into Discord server
try {
  client.login(DISCORD_TOKEN);
} catch (e) {
  console.error('[ERROR] Unable to connect to Discord server.');
  process.exit(1);
}
