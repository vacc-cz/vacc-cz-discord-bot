# VACC-CZ Discord Bot

This is Discord Bot developed by VACC-CZ which notifies Discord Channel whether somebody went online or offline.

Every `CHECK_INTERVAL` milliseconds it reads who controls on [VATSIM](https://vatsim.net), compares the controllers
whose callsign starts with `FIR_PREFIX` with the last check and posts who went online and who went offline. The last
check is kept in `LAST_ATC_ONLINE_DATA_PATH`: when that file is lost or moved, the bot announces every controller who
is online again. A message Discord does not take is sent again at the next check.

# Before you run application

Before you run this application, you have to create [Discord application](https://discord.com/developers/applications)
and Discord Bot within newly created Discord application. The bot needs no privileged intent.

To invite Discord Bot to your server, visit
https://discord.com/oauth2/authorize?client_id=DISCORD_APP_ID&scope=bot&permissions=3072, where `DISCORD_APP_ID` is
Application ID of your newly created Discord Application. The bot needs View Channel and Send Messages in its channel,
and checks them when it starts.

In the end, create `.env` file from `.env.dist` file and set `DISCORD_TOKEN` variable which represents token of
authorized Discord Bot and `DISCORD_CHANNEL_ID` variable which represents ID of Discord Channel to which the application
will send notifications. Variables set in the environment take precedence over `.env` file.

## How to run

Node.js 24 or newer is required.

1. Create `.env` file from `.env.dist` file and change its configuration
2. To install dependencies run `npm ci`
3. To start application run `node index.mjs`

To check the code, run `npm test`.
