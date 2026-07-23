// @ts-check

/** @typedef { string | ArrayBuffer | ArrayBufferView<ArrayBufferLike> } WebsocketTransferable */
/** @typedef { { data: WebsocketTransferable, finished: boolean, opCode: number, mask?: Buffer } } FrameData */

const { EventEmitter } = require("events");
const { log } = require("./log.cjs");

class WebSocketClient extends EventEmitter {
  /** @readonly @type { Map<string, WebSocketClient> } */
  static clients = new Map();
  /** @private @readonly @type { number } */
  static pingInterval_ms = 10000;
  /** @readonly */
  static OP_CODES = /** @type { const } */ ({
    CONTINUATION: 0x0,
    TEXT: 0x1,
    BINARY: 0x2,
    CLOSE: 0x8,
    PING: 0x9,
    PONG: 0xa,
  });

  /** @readonly @type { string } */
  key;
  /** @private @readonly @type { import("stream").Stream.Duplex } */
  socket;
  /** @private @type { boolean }*/
  destroyed;
  /** @private @type { FrameData | undefined } */
  lastFrameData;
  /** @private @type { NodeJS.Timeout } */
  pingTimer;
  /** @private @type { boolean } */
  unansweredPing;

  /**
   * @param { string } key
   * @param { import("stream").Stream.Duplex } socket
   */
  constructor(key, socket) {
    super({});

    WebSocketClient.clients.set(key, this);

    this.key = key;
    this.socket = socket;
    this.destroyed = false;
    this.unansweredPing = false;

    this.socket.on("close", () => {
      this.destroy();
    });

    this.socket.on("error", (error) => {
      log(`Error from client ${key}: ${error.message}`);
    });

    this.socket.on("data", (data) => {
      const decodedData = this.readFrame(data);

      switch (decodedData.opCode) {
        case WebSocketClient.OP_CODES.PING: {
          const returnData = this.writeFrame(
            decodedData.data,
            WebSocketClient.OP_CODES.PONG,
            decodedData.mask,
            true
          );

          this.socket.write(returnData);

          break;
        }
        case WebSocketClient.OP_CODES.PONG: {
          this.unansweredPing = false;

          break;
        }
        case WebSocketClient.OP_CODES.CLOSE: {
          this.destroy();
          break;
        }
        default: {
          if (decodedData.finished) {
            this.emit("data", decodedData.data);
          }

          break;
        }
      }
    });

    this.pingTimer = setInterval(() => {
      if (this.unansweredPing) {
        log(`Did not receive pong from client ${this.key}`);
        this.destroy();

        return;
      }

      this.unansweredPing = true;
      this.socket.write(
        this.writeFrame(new ArrayBuffer(), WebSocketClient.OP_CODES.PING)
      );
    }, WebSocketClient.pingInterval_ms);
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    log(`Destroying client ${this.key}`);

    clearInterval(this.pingTimer);
    WebSocketClient.clients.delete(this.key);

    this.destroyed = true;
    this.emit("destroyed");
  }

  /**
   * @param { string } text
   */
  sendText(text) {
    log(`Sending text "${text}" to client ${this.key}`);

    this.socket.write(this.writeFrame(text, WebSocketClient.OP_CODES.TEXT));
  }

  /**
   * @private
   * @param { Buffer } frame
   * @returns { FrameData }
   */
  readFrame(frame) {
    let offset = 0;

    const firstByte = frame.readUint8(offset++);
    const finished = firstByte >>> 7 === 1;
    const opCode = firstByte & 0b01111111;

    const secondByte = frame.readUint8(offset++);
    const masked = secondByte >>> 7 === 1;
    const tentativePayloadLength = secondByte & 0b01111111;
    /** @type { bigint } */
    let payloadLength = BigInt(tentativePayloadLength);

    if (tentativePayloadLength === 126) {
      payloadLength = BigInt(frame.readUint16BE(offset));
      offset += 2;
    } else if (tentativePayloadLength === 127) {
      payloadLength = frame.readBigUint64BE(offset);
      offset += 8;
    }

    /** @type { Buffer<ArrayBufferLike> } */
    let mask = Buffer.alloc(4);
    if (masked) {
      mask = frame.subarray(offset, offset + 4);
      offset += 4;
    }

    const encodedData = frame.subarray(offset, offset + Number(payloadLength));
    const decodedData = masked
      ? encodedData.map((byte, i) => byte ^ mask[i % 4])
      : new Uint8Array(encodedData);

    /** @type { FrameData } */
    let frameData = { data: new Uint8Array(), finished, opCode, mask };

    switch (opCode) {
      case WebSocketClient.OP_CODES.TEXT: {
        frameData = {
          data: new TextDecoder().decode(decodedData),
          finished,
          opCode,
          mask,
        };

        break;
      }

      case WebSocketClient.OP_CODES.BINARY: {
        frameData = { data: decodedData, finished, opCode, mask };

        break;
      }
      case WebSocketClient.OP_CODES.CONTINUATION: {
        if (this.lastFrameData === undefined) {
          log(
            `Received websocket frame with CONTINUATION op code but no previous frame provided`
          );

          break;
        }

        const previousData = this.lastFrameData.data;

        frameData = {
          data:
            typeof previousData === "string"
              ? previousData + new TextDecoder().decode(decodedData)
              : previousData instanceof Uint8Array
                ? concatenateUint8Array(previousData, decodedData)
                : new Uint8Array(),
          finished,
          opCode,
          mask,
        };

        break;
      }

      case WebSocketClient.OP_CODES.CLOSE: {
        break;
      }

      case WebSocketClient.OP_CODES.PING: {
        frameData = { data: decodedData, finished, opCode, mask };

        break;
      }
    }

    return frameData;
  }

  /**
   * @private
   * @param { Uint8Array | Buffer | ArrayBuffer | ArrayBufferView<ArrayBufferLike> |string } data
   * @param { number } opCode
   * @param { Uint8Array } [mask]
   * @param { boolean } [finished]
   * @returns { Buffer }
   */
  writeFrame(data, opCode, mask, finished = true) {
    const binaryData =
      typeof data === "string"
        ? new TextEncoder().encode(data)
        : data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : data;
    const dataSize = binaryData.byteLength;
    const tentativePayloadLength =
      dataSize <= 125 ? dataSize : dataSize <= 2 ** 16 - 1 ? 126 : 127;
    const frameLength =
      2 +
      dataSize +
      (tentativePayloadLength === 127
        ? 8
        : tentativePayloadLength === 126
          ? 2
          : 0) +
      (mask ? 4 : 0);

    const frame = Buffer.alloc(frameLength);

    const firstByte = ((finished ? 1 : 0) << 7) | opCode;
    const secondByte = ((mask ? 1 : 0) << 7) | tentativePayloadLength;

    let offset = 0;

    frame.writeUint8(firstByte, offset++);
    frame.writeUint8(secondByte, offset++);

    switch (tentativePayloadLength) {
      case 127: {
        frame.writeBigUInt64BE(BigInt(dataSize), offset);
        offset += 8;
        break;
      }
      case 126: {
        frame.writeUint16BE(dataSize, offset);
        offset += 2;
        break;
      }
    }

    if (mask) {
      frame.set(mask, offset);
      offset += 4;
    }

    frame.set(new Uint8Array(binaryData.buffer), offset);

    return frame;
  }
}

/**
 *
 * @param { Uint8Array} a
 * @param { Uint8Array } b
 * @returns { Uint8Array }
 */
function concatenateUint8Array(a, b) {
  const newArray = new Uint8Array(a.length + b.length);

  newArray.set(a);
  newArray.set(b, a.length);

  return newArray;
}

module.exports = { WebSocketClient };
