// @ts-check

import { ServerConnection } from "./ServerConnection.js";
import { UI } from "./UI.js";
import { getMBPSApp } from "./getElements.js";
import { patch } from "./patch.js";
import { updateControls } from "./updateControls.js";

patch();

function main() {
  const connection = new ServerConnection();
  const ui = new UI(connection);

  connection.ui = ui;

  const mBPSApp = getMBPSApp();
  const gameScene = mBPSApp.mSceneMgr.getManagedScene("game");
  /** @type { any } */
  let gameManager = null;

  Object.defineProperty(gameScene, "mGameMgr", {
    get() {
      return gameManager;
    },
    set(newValue) {
      gameManager = newValue;

      if (newValue === null) {
        return;
      }

      /** @type { any } */
      let game = null;
      Object.defineProperty(gameManager, "mGame", {
        get() {
          return game;
        },
        set(newValue) {
          game = newValue;

          if (newValue === null) {
            return;
          }

          updateControls();
        },
        configurable: true,
      });
    },
    configurable: true,
  });
}

let handler = setInterval(() => {
  const gameScene = getMBPSApp()?.mSceneMgr?.getManagedScene("game");

  if (gameScene) {
    clearInterval(handler);

    setTimeout(main, 500);
  }
}, 100);
