import fetch from 'node-fetch';
import VatsimDataError from '../../errors/vatsimDataError.mjs';

const DEFAULT_INACTIVE_FREQUENCY = '199.998';

export default async (dataUrl, firPrefix) => {
  let response;
  let onlineAtcData;

  try {
    response = await fetch(dataUrl);
  } catch (e) {
    throw new VatsimDataError('Unable to fetch VATSIM data.');
  }

  if (response.status !== 200) {
    throw new VatsimDataError('Unable to fetch VATSIM data.');
  }

  try {
    const data = await response.json();
    onlineAtcData = data.controllers;
  } catch (e) {
    throw new VatsimDataError('Unable to read VATSIM data.');
  }

  const atcCallSignRexExp = new RegExp(`^${firPrefix}[A-Z]{2}_([A-Z]_)?(DEL|GND|TWR|DEP|APP|D_APP|CTR)`);

  return onlineAtcData.filter(
    (atcData) => atcCallSignRexExp.test(atcData.callsign)
      && atcData.frequency !== DEFAULT_INACTIVE_FREQUENCY,
  );
};
