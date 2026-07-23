// @ts-check

const fs = require("fs");
const { ServerCLI } = require("./cli.cjs");

const IP = "127.0.0.1";
const PORT = 443;

const args = process.argv.slice(2);
const autoStart = args.includes("start");

const certPath = args
  .find((arg) => arg.startsWith("cert="))
  ?.slice("cert=".length);
const keyPath = args
  .find((arg) => arg.startsWith("key="))
  ?.slice("key=".length);

if (certPath === undefined) {
  throw new Error(
    "Path to SSL certificate required (with cert=path/to/cert.pem)"
  );
}

if (keyPath === undefined) {
  throw new Error("Path to SSL key required (with key=path/to/key.pem)");
}

if (!fs.existsSync(certPath)) {
  throw new Error(`Could not find SSL certificate at path ${certPath}`);
}

if (!fs.existsSync(keyPath)) {
  throw new Error(`Could not find SSL key at path ${keyPath}`);
}

const cert = fs.readFileSync(certPath, { encoding: "utf8" });
const key = fs.readFileSync(keyPath, { encoding: "utf8" });

const cli = new ServerCLI(IP, PORT, cert, key);

if (autoStart) {
  cli.openServer(IP, PORT).then(() => {
    cli.start();
  });
} else {
  cli.start();
}

