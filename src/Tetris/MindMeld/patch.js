// @ts-check

import { encode, decode } from "../../js/encodeDecode.js";
import { overrideXhr } from "../../js/overrideXhr.js";

function patch() {
  const dataFileName = encode("defaultTPF.json", -1);
  overrideXhr(
    (url) => url.includes("/" + dataFileName + ".txt"),
    (fileContents) => {
      const parsed = JSON.parse(decode(fileContents));

      parsed.application.savedDataId = "mindmeld";
      parsed.gameMgr.game.params.waitForReadyPlayersToStartGame = true;
      parsed.gameMgr.game.players[
        "player-base"
      ].playerComponents.control.params.smartInput.enabled = false;

      const customData = encode(JSON.stringify(parsed), -1);

      return customData;
    }
  );
}

export { patch };
