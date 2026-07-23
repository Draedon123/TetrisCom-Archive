// @ts-check

const https = require("https");
const { log } = require("./log.cjs");
const { initialiseWebsockets } = require("./websocket.cjs");
const { Room } = require("./Room.cjs");

/**
 * @param { string } cert
 * @param { string } key
 * @returns { import("https").Server }
 */
function createServer(cert, key) {
  const args = process.argv.slice(2);
  const mode = args.includes("dev") ? "dev" : "prod";
  const allowedOrigin =
    mode === "dev" ? "https://localhost:5500" : "https://tetriscom.sixwi.de";

  const server = https.createServer({ cert, key });

  initialiseWebsockets(server, allowedOrigin);

  server.on("request", (req, res) => {
    res.writeHead(200);
    res.end("test");
  });

  server.on("close", () => {
    log(`Closing server`);

    for (const room of Room.rooms.values()) {
      room.destroy();
    }

    log(`Server closed`);
  });

  return server;
}

module.exports = { createServer };
