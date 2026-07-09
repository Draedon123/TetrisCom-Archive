// @ts-check

import { UtilityMenu } from "./UtilityMenu.js";
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
    const iframe = /** @type { HTMLIFrameElement } */ (
      document.querySelector("#gameIFrame")
    );
    const data = JSON.parse(decode(fileContents));

    data.application.savedDataId += "-custom";

    const utilitySettingsKey = encode(
      data.application.savedDataId + "-settings",
      -1
    );
    const savedUtilitySettings = localStorage.getItem(utilitySettingsKey);
    /** @type { import("./UtilityMenu.js").Settings } */
    const utilitySettings = JSON.parse(
      decode(
        savedUtilitySettings ??
          encode(JSON.stringify(UtilityMenu.DEFAULT_SETTINGS), -1)
      )
    );

    if (savedUtilitySettings === null) {
      if (isMobile) {
        alert(
          "Click the 'Open Utilities' button in the bottom right to open the utilities menu!"
        );
      } else {
        alert(
          "Click the backslash button '\\' on your keyboard to open the utilities menu!"
        );
      }
    }

    data.application.savedDataId += utilitySettings.cheatsEnabled
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

    if (utilitySettings.cheatsEnabled) {
      data.application.appSupportFactory.objects.highScoresView.params.content[
        "_BPSBitmapTextView:highScoresLabel"
      ].text = "HIGH SCORES*";

      data.application.scenes.newHighScore.viewHierarchy.views[
        "_BPSUIPanel:menu"
      ].content["_BPSBitmapTextView:title"].text = "NEW HIGH SCORE!*";
      window.parent.document.body.style.backgroundColor = "#feffff";
    }

    UtilityMenu.appendTemplate().then(() => {
      initialiseUtilityMenu(iframe, utilitySettings, utilitySettingsKey);
    });

    return encode(JSON.stringify(data), -1);
  }
);

/**
 * @param { HTMLIFrameElement } iframe
 * @param { import("./UtilityMenu.js").Settings } utilitySettings
 * @param { string } utilitySettingsKey
 */
function initialiseUtilityMenu(iframe, utilitySettings, utilitySettingsKey) {
  const useTTWCPreset = location.hash.slice(1) === "ttwc";

  const utilityMenu = new UtilityMenu(
    iframe,
    utilitySettings,
    utilitySettingsKey,
    isMobile,
    useTTWCPreset
      ? {
          seed: true,
          toggleableCheats: false,
          restartKeybind: false,
        }
      : undefined
  );

  /**
   * @param { KeyboardEvent } event
   */
  function eventListener(event) {
    if (event.code === utilitySettings.toggleKeybind) {
      utilityMenu.toggle();
    }
  }

  if (isMobile) {
    const openUtilityMenuButton = /** @type { HTMLButtonElement } */ (
      document.getElementById("openUtilityMenuButton")
    );

    openUtilityMenuButton.addEventListener("click", () => {
      utilityMenu.open();
    });
  } else {
    const iframeDocument = /** @type { Document } */ (iframe.contentDocument);

    const gameCanvas = /** @type { HTMLCanvasElement } */ (
      iframeDocument.getElementById("GameCanvas")
    );

    document.addEventListener("keydown", eventListener);
    gameCanvas.addEventListener("keydown", eventListener);
    iframeDocument.body.addEventListener("keydown", eventListener);
  }
}
