import fetch from 'node-fetch';
import VatsimDataError from '../../errors/vatsimDataError.mjs';

export const VATSIM_STATUS_DATA_URL = 'https://status.vatsim.net/status.json';

export default async () => {
  let response;

  try {
    response = await fetch(VATSIM_STATUS_DATA_URL);
  } catch (e) {
    throw new VatsimDataError('Unable to fetch VATSIM status data.');
  }

  if (response.status !== 200) {
    throw new VatsimDataError('Unable to fetch VATSIM status data.');
  }

  try {
    return await response.json();
  } catch (e) {
    throw new VatsimDataError('Unable to read VATSIM status data.');
  }
};
