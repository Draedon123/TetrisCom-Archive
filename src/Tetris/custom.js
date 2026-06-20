import { CheatMenu } from "./CheatMenu.js";
import { encode, decode } from "../js/encodeDecode.js";
import { overrideXhr } from "../js/overrideXhr.js";
import { isMobileOrTablet } from "../js/isMobile.js";

const isMobile = isMobileOrTablet();

overrideXhr(
  (url) =>
    url.includes(
      "/" +
        encode(isMobile ? "defaultTPF-mobile.json" : "defaultTPF.json", -1) +
        ".txt"
    ),
  (fileContents) => {
    const iframe = document.querySelector("#gameIFrame");
    const data = JSON.parse(decode(fileContents));

    data.application.savedDataId += "-custom";

    const cheatSettingsKey = encode(data.application.savedDataId + "-settings");
    const savedCheatSettings = localStorage.getItem(cheatSettingsKey);
    const cheatSettings = JSON.parse(
      decode(savedCheatSettings ?? encode('{"enabled": true}', -1))
    );

    if (savedCheatSettings === null) {
      if (isMobile) {
        alert(
          "Click the 'Open Cheats' button in the bottom right to open the cheat menu!"
        );
      } else {
        alert(
          "Click the backslash button '\\' on your keyboard to open the cheat menu!"
        );
      }
    }

    data.application.savedDataId += cheatSettings.enabled
      ? "-cheated"
      : "-legit";

    const gameSettingsKey = encode(
      data.application.savedDataId + "-options",
      -1
    );
    const gameSettings = localStorage.getItem(gameSettingsKey);
    if (gameSettings === null) {
      const mainGameSettings = localStorage.getItem(
        encode("defaultTPF-options", -1)
      );

      if (mainGameSettings !== null) {
        localStorage.setItem(gameSettingsKey, mainGameSettings);
      }
    }

    if (cheatSettings.enabled) {
      data.application.appSupportFactory.objects.highScoresView.params.content[
        "_BPSBitmapTextView:highScoresLabel"
      ].text = "HIGH SCORES*";

      data.application.scenes.newHighScore.viewHierarchy.views[
        "_BPSUIPanel:menu"
      ].content["_BPSBitmapTextView:title"].text = "NEW HIGH SCORE!*";
      window.parent.document.body.style.backgroundColor = "#feffff";
    }

    const cheatMenu = new CheatMenu(
      iframe,
      cheatSettings,
      cheatSettingsKey,
      isMobile
    );
    const toggleKey = "Backslash";

    function eventListener(event) {
      if (event.code === toggleKey) {
        cheatMenu.toggle();
      }
    }

    if (isMobile) {
      const openCheatMenuButton = document.getElementById(
        "openCheatMenuButton"
      );

      openCheatMenuButton.addEventListener("click", () => {
        cheatMenu.open();
      });
    } else {
      document.addEventListener("keydown", eventListener);

      iframe.contentDocument
        .getElementById("GameCanvas")
        .addEventListener("keydown", eventListener);

      iframe.contentDocument.body.addEventListener("keydown", eventListener);
    }

    return encode(JSON.stringify(data), -1);
  }
);
