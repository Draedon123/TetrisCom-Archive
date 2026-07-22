// @ts-check

import { encode, decode } from "../../js/encodeDecode.js";
import { overrideXhr } from "../../js/overrideXhr.js";
import { getGameCanvas } from "./getElements.js";

function patch() {
  const dataFileName = encode("project-E60.json", -1);
  overrideXhr(
    (url) => url.includes("/" + dataFileName + ".txt"),
    (fileContents) => {
      const parsed = JSON.parse(decode(fileContents));

      const playerViews = parsed.gameMgr.gameView.playerViews;
      const player =
        parsed.gameMgr.game.players["player-base"].playerComponents;
      const battle = player.battle;

      const overlap = 140;

      parsed.application.savedDataId = "E60-versus";
      playerViews.playerViews.player1["originX@f"] = -400 + overlap;
      playerViews.playerViews.player2["originX@f"] = 400 - overlap;
      // parsed.gameMgr.game.players.players.player2.playerComponents.control =
      //   structuredClone(player.control);
      // parsed.gameMgr.game.players.players.player2.playerComponents.control.params.AIInput.enabled = true;

      parsed.gameMgr.game.params["numPlayers@i"] = 2;
      parsed.gameMgr.game.params.waitForReadyPlayersToStartGame = true;
      parsed.application["windowWidth@i"] = 1600 - 2 * overlap;
      parsed.application.scenes.loading.viewHierarchy.views[
        "_BPSScale9Sprite:backgroundImage"
      ].transform["width@f"] = 1600 - 2 * overlap;

      battle.enabled = true;
      battle.params.enableLineAttacks = false;
      battle.params.enableCounterAttacks = false;
      battle.params["knockoutsLimit@i"] = 1;

      let handler = setInterval(() => {
        try {
          getGameCanvas().style.setProperty(
            "width",
            `${1600 - 2 * overlap}px`,
            "important"
          );

          clearInterval(handler);
        } catch (error) {}
      });

      const customData = encode(JSON.stringify(parsed), -1);

      return customData;
    }
  );
}

export { patch };
