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

      case "movePiece": {
        const transform = message.transform;
        this.transformLivePiece(1, transform);

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

    // effectively pause gravity for other players
    /**
     * @param { number } t
     */
    players[1].processTime = (t) => {
      players[1].mComponents.mObjects[0].x3058980791795481325x.mModel.mFallTimerRemainingMSEC =
        Infinity;

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
    getMGameMgr().mGame.mPlayers.mObjects[
      playerIndex
    ].mComponents.mObjects[0].x3058980791795481325x.mModel.setLivePieceTransform(
      transform[0],
      transform[1],
      transform[2]
    );
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
