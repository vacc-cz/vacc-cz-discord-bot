import fs from 'fs';

export default (lastAtcOnlineDataPath, lastAtcOnlineData) => {
  fs.writeFileSync(
    lastAtcOnlineDataPath,
    JSON.stringify(lastAtcOnlineData),
    { flag: 'w+' },
  );
};
