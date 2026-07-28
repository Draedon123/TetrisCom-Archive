// @ts-check

const fs = require("fs");
const path = require("path");

const LOGS_FOLDER = path.resolve(__dirname, "../../../../server_logs");

/**
 * @param { string } message
 * @param {boolean} [writeToDisk = true]
 * @param {boolean} [writeToConsole = true]
 */
function log(message, writeToDisk = true, writeToConsole = true) {
  const time = new Date();
  const year = time.getFullYear();
  const month = leftPad((time.getMonth() + 1).toString(), 2, "0");
  const day = leftPad(time.getDate().toString(), 2, "0");
  const hour = leftPad(time.getHours().toString(), 2, "0");
  const minute = leftPad(time.getMinutes().toString(), 2, "0");
  const second = leftPad(time.getSeconds().toString(), 2, "0");

  const logEntry = `[${hour}:${minute}:${second}] | ${message}`;
  const logFileName = `${year}-${month}-${day}.txt`;

  if (writeToConsole) {
    console.log(logEntry);
  }

  if (writeToDisk) {
    if (!fs.existsSync(LOGS_FOLDER)) {
      fs.mkdirSync(LOGS_FOLDER);
    }

    fs.appendFileSync(path.join(LOGS_FOLDER, logFileName), logEntry + "\n");
  }
}

/**
 * @param { string } string
 * @param { number } length

 * @param { string } padWith
 */
function leftPad(string, length, padWith) {
  while (string.length < length) {
    string = padWith + string;
  }

  return string;
}

module.exports = { log };
