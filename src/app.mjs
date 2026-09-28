import fs from 'node:fs';

import getLastVatsimAtcOnlineDataFromFile from './services/dataService/getLastVatsimAtcOnlineDataFromFile.mjs';
import saveLastVatsimAtcOnlineDataIntoFile from './services/dataService/saveLastVatsimAtcOnlineDataIntoFile.mjs';
import getDiffOfAtcOnlineData from './services/vatsimService/getDiffOfAtcOnlineData.mjs';
import getVatsimAtcOnlineData from './services/vatsimService/getVatsimAtcOnlineData.mjs';
import getVatsimStatusData from './services/vatsimService/getVatsimStatusData.mjs';

// Describes an error with what caused it, e.g. a timeout
const describe = (error) => (error.cause ? `${error.message} ${error.cause.message}` : error.message);

// Sends a message about each ATC, in order, and returns those whose message failed
const announce = async (channel, atcs, getMessage) => {
  // discord.js sends the messages of one channel one by one, in the order they are given
  const results = await Promise.allSettled(atcs.map((atc) => channel.send(getMessage(atc))));

  return atcs.filter((atc, index) => {
    if (results[index].status === 'fulfilled') {
      return false;
    }
    console.error(`[ERROR] Unable to send message to Discord: ${results[index].reason?.message}`);

    return true;
  });
};

const appLoop = async (vatsimDataUrl, channel, appOptions) => {
  let atcOnlineData;

  // Get ATC online data
  try {
    atcOnlineData = await getVatsimAtcOnlineData(vatsimDataUrl, appOptions.firPrefix);
  } catch (e) {
    console.error(`[ERROR] Unable to get VATSIM data: ${describe(e)}`);
    return;
  }

  // Get last ATC online data
  let lastAtcOnlineData;
  try {
    lastAtcOnlineData = getLastVatsimAtcOnlineDataFromFile(appOptions.lastAtcOnlineDataPath);
  } catch (e) {
    console.error(`[ERROR] Unable to get last ATC online data: ${e.message}`);
    process.exit(1);
  }

  // Get difference who went online and who went offline
  const {
    wentOffline,
    wentOnline,
  } = getDiffOfAtcOnlineData(lastAtcOnlineData, atcOnlineData);

  // Send message to Discord channel who went online and who went offline
  wentOnline.forEach((atc) => console.log(`${atc.callsign} (${atc.name}) went online`));
  const failedOnline = await announce(
    channel,
    wentOnline,
    (atc) => `🛫 ${atc.callsign} (${atc.name}) went online on ${atc.frequency}.`,
  );
  wentOffline.forEach((atc) => console.log(`${atc.callsign} (${atc.name}) went offline`));
  const failedOffline = await announce(
    channel,
    wentOffline,
    (atc) => `🛬 ${atc.callsign} (${atc.name}) went offline.`,
  );

  // Update last ATC online data. A message that failed is sent again next time: the ATC whose going online was not
  // announced stays out of the data, the one whose going offline was not stays in.
  try {
    saveLastVatsimAtcOnlineDataIntoFile(
      appOptions.lastAtcOnlineDataPath,
      [
        ...atcOnlineData.filter((atc) => !failedOnline.includes(atc)),
        ...failedOffline,
      ],
    );
  } catch (e) {
    console.error(`[ERROR] Unable to save last ATC online data: ${e.message}`);
    process.exit(1);
  }
};

export default async (channel, appOptions) => {
  let vatsimDataUrl;

  // Get VATSIM status data
  try {
    const vatsimStatusData = await getVatsimStatusData();
    [vatsimDataUrl] = vatsimStatusData.data.v3;
  } catch (e) {
    console.error(`[ERROR] Unable to get VATSIM status data: ${describe(e)}`);
    process.exit(1);
  }
  if (vatsimDataUrl == null) {
    console.error('[ERROR] Unable to get VATSIM data, data url not found.');
    process.exit(1);
  }

  try {
    // Create file containing last ATC online data if not exists
    if (!fs.existsSync(appOptions.lastAtcOnlineDataPath)) {
      saveLastVatsimAtcOnlineDataIntoFile(appOptions.lastAtcOnlineDataPath, []);
    }
  } catch (e) {
    console.error(`[ERROR] Unable to create last ATC online data file: ${e.message}`);
    process.exit(1);
  }

  // Run application loop: each run starts when the previous one has ended, never two at once
  const loop = async () => {
    await appLoop(vatsimDataUrl, channel, appOptions);
    setTimeout(loop, appOptions.checkInterval);
  };
  await loop();
};
