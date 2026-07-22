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

  constructor() {
    const { PROTOCOL, HOST: IP } = ServerConnection;

    this.websocket = new WebSocket(`${PROTOCOL}://${IP}`);
    this.iframe = getIFrame();
    this.mBPSApp = getMBPSApp();

    const mSceneMgr = this.mBPSApp.mSceneMgr;
    const mainMenu = mSceneMgr.getManagedScene("mainMenu");
    const originalPerformPlay = mainMenu.performPlay.bind(mainMenu);

    /**
     * @param { boolean } e
     * @returns { any } actually void, but returning the output of the original
     * function is safer, probably
     */
    mainMenu.performPlay = (e) => {
      this.setIsReady(true);
      return originalPerformPlay(e);
    };

    const originalSetScene = mSceneMgr.setScene.bind(mSceneMgr);

    /**
     * @param { string } scene
     * @returns { any }
     */
    mSceneMgr.setScene = (scene) => {
      if (scene === "mainMenu") {
        this.setIsReady(false);
      }

      return originalSetScene(scene);
    };

    this.websocket.addEventListener("message", (event) => {
      console.debug("Received message: ", event.data);

      /** @type { import("./server/messageTypedefs.cjs").ServerMessage } */
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    });

    this.websocket.addEventListener("open", () => {
      console.log("Websocket connected");

      // if hash is empty, a random room id will be auto assigned
      const room = location.hash.slice(1);

      /** @type { import("./server/messageTypedefs.cjs").RoomConnectClientMessage } */
      const message = {
        type: "roomConnect",
        room,
      };

      this.websocket.send(JSON.stringify(message));
    });
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

      case "input": {
        this.executeMove(message.inputId, message.inputType, 1);
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
    const otherPlayer =
      this.mBPSApp.mSceneMgr.getManagedScene("game").mGameMgr.mGame.mPlayers
        .mObjects[1];
    const originalProcessTime = otherPlayer.processTime.bind(otherPlayer);
    // effectively pause gravity for other players
    /**
     * @param { number } t
     */
    otherPlayer.processTime = (t) => {
      otherPlayer.mComponents.mObjects[0].x3058980791795481325x.mModel.mFallTimerRemainingMSEC =
        Infinity;

      originalProcessTime(t);
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
   * @param { number } playerIndex
   */
  setupInputCapturingForPlayer(playerIndex) {
    const playerController =
      getMGameMgr().mGame.mPlayers.mObjects[playerIndex].mControlComponent
        .mInputMgr.mDelegate.x3058980791795481325x.mController;

    const originalHandleInputIsOn =
      playerController.handleInputIsOn.bind(playerController);
    const originalHandleInputIsOff =
      playerController.handleInputIsOff.bind(playerController);

    /**
     * @param { number } inputId
     * @param { boolean } a
     * @param { boolean } b
     * @param { boolean } [sendToServer = true]
     * @returns
     */
    playerController.handleInputIsOn = (inputId, a, b, sendToServer = true) => {
      if (sendToServer) {
        /** @type { import("./server/messageTypedefs.cjs").InputMessage } */
        const message = { type: "input", inputId, inputType: "on" };
        this.sendMessage(JSON.stringify(message));
      }

      return originalHandleInputIsOn(inputId, a, b);
    };

    /**
     * @param { number } inputId
     * @param { boolean } a
     * @param { boolean } b
     * @param { boolean } [sendToServer = true]
     * @returns
     */
    playerController.handleInputIsOff = (
      inputId,
      a,
      b,
      sendToServer = true
    ) => {
      if (sendToServer) {
        /** @type { import("./server/messageTypedefs.cjs").InputMessage } */
        const message = { type: "input", inputId, inputType: "off" };
        this.sendMessage(JSON.stringify(message));
      }

      return originalHandleInputIsOff(inputId, a, b);
    };
  }

  /**
   * @private
   *  @param { number } inputId
   * @param { "on" | "off" } type
   * @param { number } playerIndex
   */
  executeMove(inputId, type, playerIndex) {
    // mBPSApp.mSceneMgr.getManagedScene("game").mGameMgr.mGame.mPlayers.mObjects[0].mControlComponent.mInputMgr.mDelegate.x3058980791795481325x.mController._performControlAction
    // mBPSApp.mSceneMgr.getManagedScene("game").mGameMgr.mGame.mPlayers.mObjects[0].mComponents.mObjects[0].x3058980791795481325x.mModel
    const playerController =
      getMGameMgr().mGame.mPlayers.mObjects[playerIndex].mControlComponent
        .mInputMgr.mDelegate.x3058980791795481325x.mController;

    if (type === "on") {
      playerController.handleInputIsOn(inputId, 0, 0, false);
    } else {
      playerController.handleInputIsOff(inputId, 0, 0, false);
    }
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
    this.websocket.send(message);
  }
}

export { ServerConnection };
