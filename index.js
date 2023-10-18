const rp = require("request-promise-native");
const crypto = require("crypto");
const fs = require("fs");

const symbols = [ "2", "3", "4", "5", "6", "7", "8", "9", "B", "C", "D", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "T", "V", "W", "X", "Y", ];

const getCode = (sharedSecret, timeOffset) => {
  const time = new Date().getTime() - timeOffset;
  const interval = Math.floor(time / 30000);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(interval / Math.pow(2, 32)), 0);
  buffer.writeUInt32BE(interval % Math.pow(2, 32), 4);
  const secretBuffer = Buffer.from(sharedSecret, "base64");
  const hmac = crypto.createHmac("sha1", secretBuffer);
  const mac = hmac.update(buffer).digest();
  const start = mac[19] & 0x0f;
  let value = mac.readUInt32BE(start) & 0x7fffffff;
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += symbols[value % symbols.length];
    value = Math.floor(value / symbols.length);
  }
  return code;
};

(async () => {
  // get time offset to steam server
  let timeOffset;
  try {
    const { response } = await rp({
      uri: "https://api.steampowered.com/ITwoFactorService/QueryTime/v0001",
      method: "POST",
      json: true,
    });
    if (!response || !response.server_time) throw new Error();
    timeOffset = new Date().getTime() - parseInt(response.server_time) * 1000;
  } catch (err) {
    console.error("Steam Network ERROR:", err);
    return;
  }

  // generate 2FA codes
  try {
    const maFiles = fs.readdirSync("./maFiles");
    if (maFiles.length === 0) {
      console.log("Put your maFiles in maFiles directory, you dumbass))");
      return;
    }
    for (const fileName of maFiles) {
      const { shared_secret, account_name } = JSON.parse(fs.readFileSync("./maFiles/" + fileName));
      console.log(`${account_name}: ${getCode(shared_secret, timeOffset)}`);
    }
  } catch (err) {
    console.error("Generate 2FA Codes ERROR:", err);
    return;
  }
})();
