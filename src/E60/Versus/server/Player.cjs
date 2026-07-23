// @ts-check

const crypto = require("crypto");
const { EventEmitter } = require("events");
const { Room } = require("./Room.cjs");
const { log } = require("./log.cjs");

class Player extends EventEmitter {
  /** @private @readonly @type { import("./WebSocketClient.cjs").WebSocketClient } */
  client;
  /** @readonly @type { string } */
  id;
  /** @private @type { Room | null } */
  room;
  /** @private @type { boolean } */
  destroyed;
  /** @type { boolean } */
  ready;

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

        const room = Room.addPlayerToRoom(this, message.room);

        if (room !== null) {
          this.room = room;
        }

        break;
      }

      case "ready": {
        this.ready = message.ready;
        log(`Player ${this.id} is ${this.ready ? "" : "not "}ready`);

        this.emit("ready");

        break;
      }

      case "movePiece": {
        if (this.room === null) {
          log(`Player ${this.id} has no assigned room`);
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
          log(`Player ${this.id} has no assigned room`);
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

  destroy() {
    if (this.destroyed) {
      return;
    }

    if (this.room?.players.includes(this)) {
      this.room.removePlayer(this);
    }

    this.client.destroy();
    this.destroyed = true;

    this.emit("destroyed");
  }
}

module.exports = { Player };
