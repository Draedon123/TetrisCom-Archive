// @ts-check

const https = require("https");
const { log } = require("./log.cjs");
const { initialiseWebsockets } = require("./websocket.cjs");
const { Room } = require("./Room.cjs");

/**
 * @param { string | null } cert
 * @param { string | null } key
 * @returns { import("https").Server }
 */
function createServer(cert, key) {
  const args = process.argv.slice(2);
  const mode = args.includes("dev") ? "dev" : "prod";
  const allowedOrigin =
    mode === "dev" ? "https://localhost:5500" : "https://tetriscom.sixwi.de";

  const server = https.createServer({
    cert: cert ?? undefined,
    key: key ?? undefined,
  });

  initialiseWebsockets(server, allowedOrigin);

  server.on("request", (request, response) => {
    if (request.url === "/ping") {
      response.writeHead(200);
      response.end("pong");

      return;
    }

    response.writeHead(404);
    response.end();
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
