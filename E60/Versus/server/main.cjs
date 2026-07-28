// @ts-check

const fs = require("fs");
const { ServerCLI } = require("./cli.cjs");

const IP = "127.0.0.1";
const PORT = 60;

const args = process.argv.slice(2);
const autoStart = args.includes("start");

const certPath = args
  .find((arg) => arg.startsWith("cert="))
  ?.slice("cert=".length);
const keyPath = args
  .find((arg) => arg.startsWith("key="))
  ?.slice("key=".length);

if (certPath !== undefined && !fs.existsSync(certPath)) {
  throw new Error(`Could not find SSL certificate at path ${certPath}`);
}

if (keyPath !== undefined && !fs.existsSync(keyPath)) {
  throw new Error(`Could not find SSL key at path ${keyPath}`);
}

const cert =
  certPath === undefined
    ? null
    : fs.readFileSync(certPath, { encoding: "utf8" });
const key =
  keyPath === undefined ? null : fs.readFileSync(keyPath, { encoding: "utf8" });

const cli = new ServerCLI(IP, PORT, cert, key);

if (autoStart) {
  cli.openServer(IP, PORT).then(() => {
    cli.start();
  });
} else {
  cli.start();
}

