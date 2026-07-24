// @ts-check

const readline = require("readline/promises");
const { Room } = require("./Room.cjs");
const { log } = require("./log.cjs");
const { createServer } = require("./server.cjs");
const { Player } = require("./Player.cjs");
const { WebSocketClient } = require("./WebSocketClient.cjs");

class ServerCLI {
  /** @private @readonly @type { readline.Interface } */
  rl;
  /** @private @type { Map<number, import("net").Socket> } */
  sockets;
  /** @private @type { import("https").Server | null } */
  server;
  /** @private @readonly @type { string } */
  host;
  /** @private @readonly @type { number } */
  port;

  /**
   * @param { string } serverIp
   * @param { number } serverPort
   * @param { string | null } serverCert
   * @param { string | null } serverKey
   */
  constructor(serverIp, serverPort, serverCert, serverKey) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.server = null;
    this.sockets = new Map();
    this.host = serverIp;
    this.port = serverPort;
    this.cert = serverCert;
    this.key = serverKey;
  }

  /**
   * @param { import("https").Server | null } server
   */
  bindServer(server) {
    if (this.server !== null && server !== null) {
      log(`Attempted to bind server to already bound ServerCLI`);
      return;
    }

    this.server = server;

    if (server === null) {
      this.sockets.clear();

      return;
    }

    let nextSocketId = 0;
    server.on("connection", (socket) => {
      const socketId = nextSocketId++;
      this.sockets.set(socketId, socket);

      socket.on("close", () => {
        this.sockets.delete(socketId);
      });
    });
  }

  dumpRooms() {
    if (this.server === null) {
      log("No server active");
      return;
    }

    if (Room.rooms.size === 0) {
      log("[No active rooms]");
      return;
    }

    log(`[Found ${Room.rooms.size} active rooms]\n`);

    let i = 0;
    for (const [id, room] of Room.rooms.entries()) {
      /** @type { string[] } */
      const linesToPrint = [];

      if (room.players.length === 0) {
        linesToPrint.push("[Empty room]");
        continue;
      }

      for (let i = 0; i < room.players.length; i++) {
        const player = room.players[i];
        linesToPrint.push(`${i + 1}: ${player.id}`);
      }

      const title = id;
      const titleLength = Math.max(
        title.length + 4,
        linesToPrint.reduce((max, line) => Math.max(max, line.length), 0)
      );
      const numTitleSpaces1 = Math.floor((titleLength - 2 - title.length) / 2);
      const numTitleSpaces2 = Math.ceil((titleLength - 2 - title.length) / 2);
      const hashes = "#".repeat(titleLength);
      const space1 = " ".repeat(numTitleSpaces1);
      const space2 = " ".repeat(numTitleSpaces2);

      log(hashes);
      log(`#${space1}${title}${space2}#`);
      log(hashes);

      for (const line of linesToPrint) {
        log(line);
      }

      if (i++ < Room.rooms.size - 1) {
        log("\n");
      }
    }
  }

  dumpPlayers() {
    if (this.server === null) {
      log("No server active");
      return;
    }

    log(`${Player.players.size} named players connected`);

    for (const [username, player] of Player.players.entries()) {
      log(
        `\t${username} (${player.id})${player.room !== null ? ` in room ${player.room.id}` : ""}`
      );
    }
  }

  dumpClients() {
    if (this.server === null) {
      log("No server active");
      return;
    }

    log(`${WebSocketClient.clients.size} clients connected`);

    for (const id of WebSocketClient.clients.keys()) {
      log(`\t${id}`);
    }
  }

  closeServer() {
    if (this.server === null) {
      log("No server active");
      return;
    }

    this.server.close();

    for (const socket of this.sockets.values()) {
      socket.destroy();
    }

    this.sockets.clear();
    this.server = null;
  }

  clear() {
    console.clear();
  }

  /**
   * @param { string } secondaryCommand
   * @param { string[] } args
   */
  handleRoomsCommand(secondaryCommand, args) {
    switch (secondaryCommand) {
      case "start": {
        const roomId = args[0];
        const room = Room.rooms.get(roomId);

        if (room === undefined) {
          log(`Room ${roomId} not found`);
          break;
        }

        room.startGame();

        break;
      }

      case "seed": {
        const roomId = args[0];
        const seed = parseFloat(args[1]);
        const room = Room.rooms.get(roomId);

        if (room === undefined) {
          log(`Room ${roomId} not found`);
          break;
        }

        room.seed = isNaN(seed) ? room.getRandomSeed() : seed;

        break;
      }

      default: {
        log(`Unknown rooms command ${secondaryCommand}`);
        break;
      }
    }
  }

  /**
   * @param { string } ip
   * @param { number } port
   * @returns { Promise<import("https").Server> }
   */
  openServer(ip, port) {
    if (this.server === null) {
      const server = createServer(this.cert, this.key);

      this.bindServer(server);
    }

    const server = /** @type { import("https").Server } */ (this.server);

    return new Promise((resolve) => {
      server.listen(port, () => {
        log(`Server started on https://${ip}:${port}`);
        resolve(server);
      });
    });
  }

  async start() {
    while (true) {
      const input = (await this.rl.question("")).trim();

      log(`> ${input}`, true, false);

      if (input !== "") {
        console.log("");
      }

      const parts = input.split(" ");
      const command = parts[0];
      const args = parts.slice(1);

      switch (command) {
        case "rooms": {
          this.dumpRooms();

          break;
        }

        case "close": {
          this.closeServer();

          break;
        }

        case "open": {
          const ip = args[0];
          const port = parseInt(args[1]);

          await this.openServer(
            ip ?? this.host,
            isNaN(port) ? this.port : port
          );

          break;
        }

        case "room": {
          const secondaryCommand = args[0];

          this.handleRoomsCommand(secondaryCommand, args.slice(1));
          break;
        }

        case "clear": {
          this.clear();

          break;
        }

        case "players": {
          this.dumpPlayers();

          break;
        }

        case "clients": {
          this.dumpClients();

          break;
        }

        case "": {
          break;
        }

        default: {
          log(`Unknown command "${command}"`);
          break;
        }
      }
    }
  }
}

module.exports = { ServerCLI };

