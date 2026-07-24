// @ts-check

import { getMGameMgr, getIFrame, getMBPSApp } from "./getElements.js";

class ServerConnection {
  /** @private @readonly @type { string } */
  static PROTOCOL = "wss";
  /** @private @readonly @type { string } */
  static HOST = "e60versus.draedon.xyz";

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

  constructor() {
    const { PROTOCOL, HOST: IP } = ServerConnection;

    this.websocket = new WebSocket(`${PROTOCOL}://${IP}`);
    this.iframe = getIFrame();
    this.mBPSApp = getMBPSApp();
    this.connected = false;
    this.queuedMessages = [];
    this._username = "";
    this.ui = null;

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
      if (scene === "mainMenu" && this._username !== "") {
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
        const transform = message.transform;
        this.transformLivePiece(1, transform);

        break;
      }

      case "lockPiece": {
        this.lockLivePiece(1);

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
        this.ui?.handleRoomConnectResponse(message);

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
    players[1].setIsReadyToStartGame();

    this.patchPlayers();
  }

  /**
   * @private
   */
  patchPlayers() {
    const gameManager = getMGameMgr();
    const players = gameManager.mGame.mPlayers.mObjects;
    const originalProcessTime = players[1].processTime.bind(players[1]);
    const playerModel =
      players[0].mComponents.mObjects[0].x3058980791795481325x.mModel;
    const originalSetLivePieceTransform =
      playerModel.setLivePieceTransform.bind(playerModel);
    const originalLockLivePiece = playerModel.lockLivePiece.bind(playerModel);

    // effectively pause gravity for other players
    /**
     * @param { number } t
     */
    players[1].processTime = (t) => {
      players[1].mComponents.mObjects[0].x3058980791795481325x.mModel.mFallTimerRemainingMSEC =
        Infinity;

      // idk why i have to set this more than once...
      players[1].mParams.setIntValueWithKeyStringPath("generationTimeMSEC", 0);

      originalProcessTime(t);
    };

    /**
     * @param { number } transform
     * @param { number } transformType
     * @param { number } isRotation as a boolean
     */
    playerModel.setLivePieceTransform = (
      transform,
      transformType,
      isRotation
    ) => {
      /** @type { import("./server/messageTypedefs.cjs").TransformLivePieceMessage } */
      const message = {
        type: "movePiece",
        transform: [transform, transformType, isRotation],
      };
      this.sendMessage(JSON.stringify(message));

      originalSetLivePieceTransform(transform, transformType, isRotation);
    };

    playerModel.lockLivePiece = () => {
      /** @type { import("./server/messageTypedefs.cjs").LockPieceMessage } */
      const message = { type: "lockPiece" };
      this.sendMessage(JSON.stringify(message));

      originalLockLivePiece();
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
        .x3058980791795481325x.mModel;

    model.setLivePieceTransform(transform[0], transform[1], transform[2]);
  }

  /**
   * @private
   * @param { number } playerIndex
   */
  lockLivePiece(playerIndex) {
    const model =
      getMGameMgr().mGame.mPlayers.mObjects[playerIndex].mComponents.mObjects[0]
        .x3058980791795481325x.mModel;

    model.lockLivePiece();
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
