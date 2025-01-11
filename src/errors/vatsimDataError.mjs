class VatsimDataError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VatsimDataError);
    }
  }
}

export default VatsimDataError;
