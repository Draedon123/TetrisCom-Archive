// @ts-check

const fs = require("fs");
const { ServerCLI } = require("./cli.cjs");

const IP = "127.0.0.1";
const PORT = 443;

const args = process.argv.slice(2);
const autoStart = args.includes("start");

const cli = new ServerCLI(IP, PORT);

if (autoStart) {
  cli.openServer(IP, PORT).then(() => {
    cli.start();
  });
} else {
  cli.start();
}
