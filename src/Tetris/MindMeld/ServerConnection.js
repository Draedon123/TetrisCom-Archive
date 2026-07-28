// @ts-check

import { getMGameMgr, getIFrame, getMBPSApp } from "./getElements.js";
import { CONTROLS, INPUT_IDS } from "./keyCodeMap.js";

class ServerConnection {
  /** @private @readonly @type { string } */
  static PROTOCOL = "wss";
  /** @private @readonly @type { string } */
  static HOST = "mindmeld.draedon.xyz";

  /** @private @readonly @type { WebSocket } */
  websocket;
  /** @private @readonly @type { HTMLIFrameElement } */
  iframe;
  /** @private @readonly @type { any } */
  mBPSApp;
  /** @private @type { boolean } */
  connected;
  /** @private @type { string[] } */
  queuedMessages;
  /** @type { import("./UI.js").UI | null } */
  ui;
  /** @private @type { string } */
  _username;
  /** @private @type { string | null} */
  room;
  /** @private @type { number } */
  numLockedPieces;

  constructor() {
    const { PROTOCOL, HOST: IP } = ServerConnection;

    this.websocket = new WebSocket(`${PROTOCOL}://${IP}`);
    this.iframe = getIFrame();
    this.mBPSApp = getMBPSApp();
    this.connected = false;
    this.queuedMessages = [];
    this._username = "";
    this.ui = null;
    this.room = null;
    this.numLockedPieces = 0;
    // this.ignoreFall = true;

    const mSceneMgr = this.mBPSApp.mSceneMgr;
    const mainMenu = mSceneMgr.getManagedScene("mainMenu");
    const gameScene = mSceneMgr.getManagedScene("game");
    const originalPerformPlay = mainMenu.performPlay.bind(mainMenu);
    const originalSetScene = mSceneMgr.setScene.bind(mSceneMgr);

    /**
     * @param { boolean } e
     * @returns { any } actually void, but returning the output of the original
     * function is safer, probably
     */
    mainMenu.performPlay = (e) => {
      if (this.username === "") {
        return;
      }

      this.setIsReady(true);
      return originalPerformPlay(e);
    };

    /**
     * @param { string } scene
     * @returns { any }
     */
    mSceneMgr.setScene = (scene) => {
      if (scene === "mainMenu" && this.room !== null) {
        this.setIsReady(false);
      }

      return originalSetScene(scene);
    };

    gameScene.pauseGame = () => {};

    this.websocket.addEventListener("message", (event) => {
      console.debug("Received message: ", event.data);

      /** @type { import("./server/messageTypedefs.cjs").ServerMessage } */
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    });

    this.websocket.addEventListener("open", () => {
      console.debug("Websocket connected");
      this.connected = true;

      for (const message of this.queuedMessages) {
        this.sendMessage(message);
      }
    });

    this.websocket.addEventListener("error", () => {
      alert("Failed to connect to server. Maybe the server isn't running?");
    });
  }

  /**
   * @returns { string }
   */
  get username() {
    return this._username;
  }

  /**
   * @param { string } username
   */
  set username(username) {
    if (this.username === username) {
      return;
    }

    /** @type { import("./server/messageTypedefs.cjs").UpdateUsernameClientMessage } */
    const message = { type: "updateUsername", username };
    this.sendMessage(JSON.stringify(message));
  }

  /**
   * @private
   * @param { import("./server/messageTypedefs.cjs").ServerMessage } message
   */
  handleMessage(message) {
    switch (message.type) {
      case "startGame": {
        this.tryStartGame();
        break;
      }

      case "setSeed": {
        this.setSeed(message.seed);
        break;
      }

      case "movePiece": {
        if (message.transform[1] === 0) {
          break;
        }

        const transform = message.transform;

        this.transformLivePiece(0, transform);

        break;
      }

      case "lockPiece": {
        this.lockLivePiece(0, message.lockNumber);

        break;
      }

      case "setUsernameResponse": {
        if (message.ok) {
          this._username = message.username;
        }

        this.ui?.handleSetUsernameResponse(message);

        break;
      }

      case "roomList": {
        this.ui?.setRoomList(message.rooms);

        break;
      }

      case "roomConnectResponse": {
        if (message.ok) {
          this.room = message.room;
        }

        this.ui?.handleRoomConnectResponse(message);

        break;
      }

      case "hold": {
        const controller =
          getMGameMgr().mGame.mPlayers.mObjects[0].mControlComponent.mInputMgr
            .mDelegate.x2502000583453341681x;
        controller.handleInputIsOn(INPUT_IDS.hold, 0, 0, false, false);
        controller.handleInputIsOff(INPUT_IDS.hold, 0, 0, false, false);

        break;
      }

      default: {
        console.error(
          // @ts-expect-error
          `Received unknown message type "${message.type}" from server`
        );
        break;
      }
    }
  }

  /**
   * @private
   */
  tryStartGame() {
    const mGameMgr = getMGameMgr();

    if (mGameMgr === null) {
      console.log("Player not ready to start game yet");
      return;
    }

    const players = mGameMgr.mGame.mPlayers.mObjects;

    players[0].setIsReadyToStartGame();

    this.patchPlayers();
    this.numLockedPieces = 0;
    // this.ignoreFall = true;
  }

  /**
   * @private
   */
  patchPlayers() {
    const gameManager = getMGameMgr();
    const players = gameManager.mGame.mPlayers.mObjects;
    const playerModel =
      players[0].mControlComponent.x2502000583453341681x.mModel;
    const originalSetLivePieceTransform =
      playerModel.setLivePieceTransform.bind(playerModel);
    const originalLockLivePiece = playerModel.lockLivePiece.bind(playerModel);
    const controller =
      players[0].mControlComponent.mInputMgr.mDelegate.x2502000583453341681x;
    const originalHandleInputIsOn = controller.handleInputIsOn.bind(controller);
    const originalHandleInputIsOff =
      controller.handleInputIsOff.bind(controller);

    /**
     * @param { number } inputId
     * @param { number } a
     * @param { number } b
     * @param { boolean } [sendToServer]
     */
    controller.handleInputIsOn = (inputId, a, b, sendToServer = true) => {
      if (inputId === INPUT_IDS.hold && sendToServer) {
        /** @type { import("./server/messageTypedefs.cjs").HoldPieceMessage} */
        const message = { type: "hold" };
        this.sendMessage(JSON.stringify(message));
      }

      // if (inputId === INPUT_IDS.softDrop) {
      //   this.ignoreFall = false;
      // }

      return originalHandleInputIsOn(inputId, a, b);
    };

    /**
     * @param { number } inputId
     * @param { number } a
     * @param { number } b
     */
    controller.handleInputIsOff = (inputId, a, b) => {
      // if (inputId === INPUT_IDS.softDrop) {
      //   this.ignoreFall = true;
      // }

      return originalHandleInputIsOff(inputId, a, b);
    };

    /**
     * @param { number } transform
     * @param { number } transformType
     * @param { number } isRotation as a boolean
     * @param { boolean } [sendToServer]
     */
    playerModel.setLivePieceTransform = (
      transform,
      transformType,
      isRotation,
      sendToServer = true
    ) => {
      if (sendToServer) {
        /** @type { import("./server/messageTypedefs.cjs").TransformLivePieceMessage } */
        const message = {
          type: "movePiece",
          transform: [transform, transformType, isRotation],
        };
        this.sendMessage(JSON.stringify(message));
      }

      return originalSetLivePieceTransform(
        transform,
        transformType,
        isRotation
      );
    };

    playerModel.lockLivePiece = (lockNumber = -1) => {
      if (lockNumber === this.numLockedPieces) {
        return;
      }

      this.numLockedPieces++;

      /** @type { import("./server/messageTypedefs.cjs").LockPieceMessage } */
      const message = { type: "lockPiece", lockNumber: this.numLockedPieces };
      this.sendMessage(JSON.stringify(message));

      return originalLockLivePiece();
    };
  }

  /**
   * @private
   * @param { number } seed
   */
  setSeed(seed) {
    // @ts-expect-error
    this.iframe.contentWindow.Math.random = () => seed;

    // have to reload game to update seed
    if (this.inGame) {
      this.mBPSApp.mSceneMgr.setScene("mainMenu");
      this.mBPSApp.mSceneMgr.getManagedScene("mainMenu").performPlay();
    }
  }

  /**
   * @param {*} ready
   */
  setIsReady(ready) {
    /** @type { import("./server/messageTypedefs.cjs").ReadyClientMessage } */
    const message = { type: "ready", ready };
    this.sendMessage(JSON.stringify(message));
  }

  /**
   * @private
   * @param { number } playerIndex
   * @param { [number, number, number] } transform
   */
  transformLivePiece(playerIndex, transform) {
    const model =
      getMGameMgr().mGame.mPlayers.mObjects[playerIndex].mComponents.mObjects[0]
        .x2502000583453341681x.mModel;

    model.setLivePieceTransform(
      transform[0],
      transform[1],
      transform[2],
      false
    );

    model.updateDirectModeGhostPiece();
  }

  /**
   * @private
   * @param { number } playerIndex
   * @param { number } lockNumber
   */
  lockLivePiece(playerIndex, lockNumber) {
    const model =
      getMGameMgr().mGame.mPlayers.mObjects[playerIndex].mComponents.mObjects[0]
        .x2502000583453341681x.mModel;

    model.lockLivePiece(lockNumber);
  }

  /**
   * @returns { boolean }
   */
  get inGame() {
    return this.mBPSApp.mSceneMgr.getCurrentScene().mSceneName === "game";
  }

  /**
   * @param { string } message
   */
  sendMessage(message) {
    if (this.connected) {
      console.debug("Sending message:\n", message);
      this.websocket.send(message);
    } else {
      console.debug("Queueing message:\n", message);
      this.queuedMessages.push(message);
    }
  }
}

export { ServerConnection };
