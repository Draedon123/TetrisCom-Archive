import { CheatMenu } from "./CheatMenu.js";
import { encode, decode } from "/js/encodeDecode.js";

function patch(iframe, data) {
  data.application.savedDataId += "-custom";

  const cheatSettingsKey = encode(data.application.savedDataId + "-settings");
  const savedCheatSettings = localStorage.getItem(cheatSettingsKey);
  const cheatSettings = JSON.parse(
    decode(savedCheatSettings ?? encode('{"enabled": true}', -1))
  );

  if (savedCheatSettings === null) {
    alert(
      "Click the backslash button '\\' on your keyboard to open the cheat menu!"
    );
  }

  data.application.savedDataId += cheatSettings.enabled ? "-cheated" : "-legit";

  const gameSettingsKey = encode(data.application.savedDataId + "-options", -1);
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

  const cheatMenu = new CheatMenu(iframe, cheatSettings, cheatSettingsKey);
  const toggleKey = "Backslash";

  function eventListener(event) {
    if (event.code === toggleKey) {
      cheatMenu.toggle();
    }
  }

  document.addEventListener("keydown", eventListener);

  iframe.contentDocument
    .getElementById("GameCanvas")
    .addEventListener("keydown", eventListener);

  iframe.contentDocument.body.addEventListener("keydown", eventListener);
}

let handler = setInterval(() => {
  try {
    const iframe = document.querySelector("#gameIFrame");

    const OriginalXMLHttpRequest = iframe.contentWindow.XMLHttpRequest;
    iframe.contentWindow.XMLHttpRequest = function () {
      const xhr = new OriginalXMLHttpRequest();
      const originalOpen = xhr.open;

      xhr.open = function (method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
      };

      const originalSend = xhr.send;
      xhr.send = function () {
        const originalOnReadyStateChange = this.onreadystatechange;

        this.onreadystatechange = function () {
          if (
            this.readyState === 4 &&
            this._url.includes("/" + encode("defaultTPF.json", -1) + ".txt")
          ) {
            const data = JSON.parse(decode(this.responseText));

            patch(iframe, data);

            const encoded = encode(JSON.stringify(data), -1);
            Object.defineProperty(this, "responseText", {
              writable: true,
              value: encoded,
            });
          }

          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.apply(this, arguments);
          }
        };
        return originalSend.apply(this, arguments);
      };
      return xhr;
    };

    clearInterval(handler);
  } catch (e) {}
}, 1);
