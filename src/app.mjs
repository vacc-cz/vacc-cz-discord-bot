import fs from 'fs';
import getDiffOfAtcOnlineData from './services/vatsimService/getDiffOfAtcOnlineData.mjs';
import getVatsimAtcOnlineData from './services/vatsimService/getVatsimAtcOnlineData.mjs';
import getVatsimStatusData from './services/vatsimService/getVatsimStatusData.mjs';
import getLastVatsimAtcOnlineDataFromFile from './services/dataService/getLastVatsimAtcOnlineDataFromFile.mjs';
import saveLastVatsimAtcOnlineDataIntoFile from './services/dataService/saveLastVatsimAtcOnlineDataIntoFile.mjs';

const appLoop = async (vatsimDataUrl, client, appOptions) => {
  let atcOnlineData;

  // Get ATC online data
  try {
    atcOnlineData = await getVatsimAtcOnlineData(vatsimDataUrl, appOptions.firPrefix);
  } catch (e) {
    console.error('[ERROR] Unable to get VATSIM data.');
    return;
  }

  // Get last ATC online data
  let lastAtcOnlineData;
  try {
    lastAtcOnlineData = getLastVatsimAtcOnlineDataFromFile(appOptions.lastAtcOnlineDataPath);
  } catch (e) {
    console.error('[ERROR] Unable to get last ATC online data.');
    process.exit(1);
  }

  // Get difference who went online and who went offline
  const {
    wentOnline,
    wentOffline,
  } = getDiffOfAtcOnlineData(lastAtcOnlineData, atcOnlineData);

  try {
    // Send message to Discord channel who went online
    wentOnline.forEach((atc) => {
      console.log(`${atc.callsign} (${atc.name}) went online`);
      client.channels.cache.get(appOptions.discordChannelId)
        .send(`🛫 ${atc.callsign} (${atc.name}) went online on ${atc.frequency}.`);
    });

    // Send message to Discord channel who went offline
    wentOffline.forEach((atc) => {
      console.log(`${atc.callsign} (${atc.name}) went offline`);
      client.channels.cache.get(appOptions.discordChannelId)
        .send(`🛬 ${atc.callsign} (${atc.name}) went offline.`);
    });
  } catch (e) {
    console.error('[ERROR] Unable to send message to Discord.');
    return;
  }

  try {
    // Update last ATC online data
    saveLastVatsimAtcOnlineDataIntoFile(appOptions.lastAtcOnlineDataPath, atcOnlineData);
  } catch (e) {
    console.error('[ERROR] Unable to save last ATC online data.');
    process.exit(1);
  }
};

export default async (client, appOptions) => {
  let vatsimDataUrl;

  // Get VATSIM status data
  try {
    const vatsimStatusData = await getVatsimStatusData();
    vatsimDataUrl = vatsimStatusData.data.v3[0]; // eslint-disable-line prefer-destructuring

    if (vatsimDataUrl == null) {
      console.error('[ERROR] Unable to get VATSIM data, data url not found.');
      process.exit(1);
    }
  } catch (e) {
    console.error('[ERROR] Unable to get VATSIM status data.');
    process.exit(1);
  }

  try {
    // Create file containing last ATC online data if not exists
    if (!fs.existsSync(appOptions.lastAtcOnlineDataPath)) {
      saveLastVatsimAtcOnlineDataIntoFile(appOptions.lastAtcOnlineDataPath, []);
    }
  } catch (e) {
    console.error('[ERROR] Unable to create last ATC online data file.');
    process.exit(1);
  }

  // Run application loop
  await appLoop(vatsimDataUrl, client, appOptions);
  setInterval(async () => {
    await appLoop(vatsimDataUrl, client, appOptions);
  }, appOptions.checkInterval);
};
