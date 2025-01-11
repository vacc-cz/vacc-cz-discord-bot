# VACC-CZ Discord Bot

This is Discord Bot developed by VACC-CZ which notifies Discord Channel whether somebody went online or offline. 

# Before you run application

Before you run this application, you have to create [Discord application](https://discord.com/developers/applications) and Discord Bot within newly create Discord application.

To invite Discord Bot to your server, visit https://discord.com/oauth2/authorize?client_id=DISCORD_APP_ID&scope=bot&permissions=137439217664, where `DISCORD_APP_ID` is Application ID of your newly created Discord Application.

In the end, create `.env` file from `.env.dist` file and set `TOKEN` variable which represent token of authorized Discord Bot and `DISCORD_CHANNEL_ID` variable which represents ID of Discord Channel to which the application will send notifications.

## How to run

1. Create `.env` file from `.env.dist` file and change its configuration
2. To install dependencies run `npm ci`
3. To start application run `node index.mjs`
