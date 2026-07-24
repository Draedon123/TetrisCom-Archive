// @ts-check

const crypto = require("crypto");
const { EventEmitter } = require("events");
const { Room } = require("./Room.cjs");
const { log } = require("./log.cjs");

class Player extends EventEmitter {
  /** @readonly @type { Map<string, Player> } */
  static players = new Map();
  /** @private @readonly @type { import("./WebSocketClient.cjs").WebSocketClient } */
  client;
  /** @readonly @type { string } */
  id;
  /** @type { Room | null } */
  room;
  /** @private @type { boolean } */
  destroyed;
  /** @type { boolean } */
  ready;
  /** @type { string} */
  username;

  /**
   * @param { import("./WebSocketClient.cjs").WebSocketClient } client
   */
  constructor(client) {
    super();

    this.client = client;
    this.id = client.key;
    this.room = null;
    this.destroyed = false;
    this.ready = false;
    this.username = "";

    this.client.on("data", (_data) => {
      /** @type { import("./WebSocketClient.cjs").WebsocketTransferable } */
      const data = _data;

      if (typeof data === "string") {
        const message = JSON.parse(data);

        this.handleMessage(message);
      }
    });

    this.client.on("destroyed", () => {
      this.destroy();
    });
  }

  /**
   * @private
   * @param { import("./messageTypedefs.cjs").ClientMessage } message
   */
  handleMessage(message) {
    switch (message.type) {
      case "roomConnect": {
        if (message.room === "") {
          message.room = crypto.randomUUID();
        }

        if (this.room !== null) {
          this.room.removePlayer(this);
        }

        const room = Room.addPlayerToRoom(this, message.room);

        if (room.players.includes(this)) {
          this.room = room;
          this.sendRoomConnectResponse(null, message.room);
        } else {
          this.sendRoomConnectResponse("Room full", message.room);
        }

        break;
      }

      case "ready": {
        this.ready = message.ready;
        log(`Player ${this.username} is ${this.ready ? "" : "not "}ready`);

        this.emit("ready");

        break;
      }

      case "movePiece": {
        if (this.room === null) {
          log(`Player ${this.username} has no assigned room`);
          break;
        }

        for (const player of this.room.players) {
          if (player === this) {
            continue;
          }

          player.sendLivePieceTransform(message.transform);
        }

        break;
      }

      case "lockPiece": {
        if (this.room === null) {
          log(`Player ${this.username} has no assigned room`);
          break;
        }

        for (const player of this.room.players) {
          if (player === this) {
            continue;
          }

          player.sendLockPiece();
        }

        break;
      }

      case "updateUsername": {
        const username = message.username;

        if (this.username === username) {
          this.sendSetUsernameResponse(null, username);
          break;
        }

        if (Player.players.has(username)) {
          this.sendSetUsernameResponse("Username already in use", username);
          break;
        }

        if (this.username === "") {
          this.username = username;
          Player.players.set(username, this);
          this.sendSetUsernameResponse(null, username);

          log(`Set username of ${this.id} to ${username}`);

          break;
        }

        log(
          `Changed username of ${this.id} from ${this.username} to ${username}`
        );

        Player.players.delete(this.username);
        this.username = username;
        Player.players.set(this.username, this);
        this.sendSetUsernameResponse(null, username);

        break;
      }

      case "getRooms": {
        /** @type { import("./messageTypedefs.cjs").RoomListServerMessage } */
        const message = { type: "roomList", rooms: [] };

        for (const [id, room] of Room.rooms.entries()) {
          message.rooms.push({
            id,
            players: room.players.map((player) => player.username),
          });
        }

        this.client.sendText(JSON.stringify(message));

        break;
      }

      default: {
        log(
          // @ts-expect-error ideally this branch is never reached
          `Received unknown message type "${message.type}" from client ${this.id}`
        );

        break;
      }
    }
  }

  sendStartGameMessage() {
    /** @type { import("./messageTypedefs.cjs").StartGameServerMessage } */
    const message = { type: "startGame" };

    this.client.sendText(JSON.stringify(message));
  }

  /**
   * @param { number } seed
   */
  sendSeed(seed) {
    /** @type { import("./messageTypedefs.cjs").SetSeedServerMessage } */
    const message = { type: "setSeed", seed };

    this.client.sendText(JSON.stringify(message));
  }

  /**
   * @private
   * @param { [number, number, number] } transform
   */
  sendLivePieceTransform(transform) {
    /** @type { import("./messageTypedefs.cjs").TransformLivePieceMessage} */
    const message = { type: "movePiece", transform };

    this.client.sendText(JSON.stringify(message));
  }

  /**
   * @private
   */
  sendLockPiece() {
    /** @type { import("./messageTypedefs.cjs").LockPieceMessage } */
    const message = { type: "lockPiece" };

    this.client.sendText(JSON.stringify(message));
  }

  /**
   * @private
   * @param { string | null } error
   * @param { string } username
   */
  sendSetUsernameResponse(error, username) {
    /** @type { import("./messageTypedefs.cjs").SetUsernameResponseServerMessage } */
    const message = {
      type: "setUsernameResponse",
      ok: error === null,
      error: error ?? undefined,
      username,
    };

    this.client.sendText(JSON.stringify(message));
  }

  /**
   * @private
   * @param { string | null } error
   * @param { string } room
   */
  sendRoomConnectResponse(error, room) {
    /** @type { import("./messageTypedefs.cjs").RoomConnectResponseServerMessage } */
    const message = {
      type: "roomConnectResponse",
      ok: error === null,
      error: error ?? undefined,
      room,
    };

    this.client.sendText(JSON.stringify(message));
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    if (this.room?.players.includes(this)) {
      this.room.removePlayer(this);
    }

    Player.players.delete(this.username);

    this.client.destroy();
    this.destroyed = true;

    this.emit("destroyed");
  }
}

module.exports = { Player };
