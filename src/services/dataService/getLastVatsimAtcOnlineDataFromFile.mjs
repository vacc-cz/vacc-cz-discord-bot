import fs from 'fs';

export default (lastAtcOnlineDataPath) => {
  const data = fs.readFileSync(lastAtcOnlineDataPath);

  return JSON.parse(data);
};
