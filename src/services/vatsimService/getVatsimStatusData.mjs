import VatsimDataError from '../../errors/vatsimDataError.mjs';

export const VATSIM_STATUS_DATA_URL = 'https://status.vatsim.net/status.json';

// How long VATSIM has to answer, in milliseconds
const FETCH_TIMEOUT = 10000;

export default async () => {
  let response;

  try {
    response = await fetch(VATSIM_STATUS_DATA_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  } catch (e) {
    throw new VatsimDataError('Unable to fetch VATSIM status data.', { cause: e });
  }

  if (response.status !== 200) {
    throw new VatsimDataError('Unable to fetch VATSIM status data.');
  }

  try {
    return await response.json();
  } catch (e) {
    throw new VatsimDataError('Unable to read VATSIM status data.', { cause: e });
  }
};
