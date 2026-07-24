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

      parsed.application.savedDataId = "E60-versus";
      playerViews.playerViews.player1["originX@f"] = -300;
      playerViews.playerViews.player2["originX@f"] = 300;

      parsed.gameMgr.gameView.playerViews.playerViews.player1.background =
        structuredClone(
          parsed.gameMgr.gameView.playerViews["playerView-base"].background
        );
      parsed.gameMgr.gameView.playerViews.playerViews.player2.background =
        structuredClone(
          parsed.gameMgr.gameView.playerViews["playerView-base"].background
        );

      const assetsPath = "versus";

      parsed.gameMgr.gameView.playerViews.playerViews.player1.background.resource_texture = `${assetsPath}/main-background-game-v3-left.png`;
      parsed.gameMgr.gameView.playerViews.playerViews.player2.background.resource_texture = `${assetsPath}/main-background-game-v3-right.png`;

      // image resized from 800x600 to 600x600, shifting the centre of the image
      // 100px to the left. hence, we need to shift it 100px to the right again
      parsed.gameMgr.gameView.playerViews["playerView-base"].matrix.transform[
        "x@f"
      ] += 100;
      parsed.gameMgr.gameView.playerViews["playerView-base"].nextQueue[
        "firstPieceCenterX@f"
      ] += 100;
      parsed.gameMgr.gameView.playerViews["playerView-base"].scoreValue[
        "positionX@f"
      ] += 100;
      parsed.gameMgr.gameView.playerViews["playerView-base"].levelValue[
        "positionX@f"
      ] += 100;
      parsed.gameMgr.gameView.playerViews["playerView-base"].linesValue[
        "positionX@f"
      ] += 100;

      parsed.gameMgr.game.params["numPlayers@i"] = 2;
      parsed.gameMgr.game.params.waitForReadyPlayersToStartGame = true;
      parsed.application["windowWidth@i"] = 1200;
      parsed.application.scenes.loading.viewHierarchy.views[
        "_BPSScale9Sprite:backgroundImage"
      ].transform["width@f"] = 1200;
      parsed.application.scenes.loading.viewHierarchy.views[
        "_BPSScale9Sprite:backgroundImage"
      ].style.resource_texture = `${assetsPath}/loading.png`;
      parsed.application.scenes.game["_BPSView:loadingView"].children[
        "_BPSSprite:loadingImage"
      ].resource_texture = `${assetsPath}/loading.png`;

      battle.enabled = true;
      battle.params.enableLineAttacks = false;
      battle.params.enableCounterAttacks = false;
      battle.params["knockoutsLimit@i"] = 1;

      let handler = setInterval(() => {
        try {
          getGameCanvas().style.setProperty("width", "1200px", "important");

          clearInterval(handler);
        } catch (error) {}
      });

      const customData = encode(JSON.stringify(parsed), -1);

      return customData;
    }
  );
}

export { patch };
