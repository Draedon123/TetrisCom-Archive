// @ts-check

const crypto = require("crypto");
const { log } = require("./log.cjs");
const { WebSocketClient } = require("./WebSocketClient.cjs");
const { Player } = require("./Player.cjs");

const WEBSOCKET_MAGIC_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

/**
 * @param { import("https").Server } server
 * @param { string } allowedOrigin
 */
function initialiseWebsockets(server, allowedOrigin) {
  const MAX_CONNECTIONS_PER_IP = 10;

  /** @type { Record<string, number> } */
  const connectionsPerIp = {};

  server.on("upgrade", (request, stream) => {
    const ip = request.socket.localAddress;

    if (ip === undefined) {
      stream.end(`HTTP 400/${request.httpVersion}: Bad Request\r\n\r\n`);
      log(`Could not find ip address of upgrade request`);
      return;
    }

    if (connectionsPerIp[ip] >= MAX_CONNECTIONS_PER_IP) {
      stream.end(`HTTP 429/${request.httpVersion}: Too Many Requests\r\n\r\n`);
      log(
        `IP ${ip} exceeded maximum concurrent connections (${MAX_CONNECTIONS_PER_IP})`
      );
      return;
    }

    connectionsPerIp[ip] = (connectionsPerIp[ip] ?? 0) + 1;

    stream.on("close", () => {
      connectionsPerIp[ip]--;
    });

    if (request.headers.upgrade !== "websocket") {
      stream.end(`HTTP 400/${request.httpVersion}: Bad Request\r\n\r\n`);
      log(`Received unknown upgrade request ${request.headers.upgrade}`);
      return;
    }

    if (request.headers.origin !== allowedOrigin) {
      stream.end(`HTTP 403/${request.httpVersion}: Forbidden\r\n\r\n`);
      log(
        `Received websocket upgrade request from disallowed origin (${request.headers.origin} !== ${allowedOrigin})`
      );
      return;
    }

    const clientKey = request.headers["sec-websocket-key"];
    if (clientKey === undefined) {
      stream.end(`HTTP 400/${request.httpVersion}: Bad Request\r\n\r\n`);
      log(`Received websocket upgrade request without sec-websocket-key`);
      return;
    }

    log(`Client ${clientKey} requesting connection`);

    if (WebSocketClient.clients.has(clientKey)) {
      stream.end(`HTTP 400/${request.httpVersion}: Bad Request\r\n\r\n`);
      log(`Client ${clientKey} already exists`);
      return;
    }

    stream.write(
      [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${getWebsocketAccept(clientKey)}`,
      ].join("\r\n") + "\r\n\r\n"
    );

    log(`Client ${clientKey} connected`);

    new Player(new WebSocketClient(clientKey, stream));
  });
}

/**
 * @param { string } clientKey
 * @returns { string }
 */
function getWebsocketAccept(clientKey) {
  return crypto
    .createHash("sha1")
    .update(clientKey + WEBSOCKET_MAGIC_KEY)
    .digest("base64");
}

module.exports = { initialiseWebsockets };
