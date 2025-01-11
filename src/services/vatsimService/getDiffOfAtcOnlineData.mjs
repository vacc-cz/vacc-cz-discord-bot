export default (lastAtcOnlineData, currentAtcOnlineData) => {
  const wentOnline = currentAtcOnlineData.filter(
    (currentAtc) => !lastAtcOnlineData.find(
      (lastAtc) => currentAtc.cid === lastAtc.cid && currentAtc.callsign === lastAtc.callsign,
    ),
  );
  const wentOffline = lastAtcOnlineData.filter(
    (lastAtc) => !currentAtcOnlineData.find(
      (currentAtc) => currentAtc.cid === lastAtc.cid && currentAtc.callsign === lastAtc.callsign,
    ),
  );

  return {
    wentOffline,
    wentOnline,
  };
};
