(function () {
  "use strict";

  function boot() {
    var settings = window._CCSettings;
    window._CCSettings = undefined;

    if (!settings.debug) {
      var rawAssets = settings.rawAssets;
      var assetTypes = settings.assetTypes;
      for (var mount in rawAssets) {
        var entries = rawAssets[mount];
        for (var uuid in entries) {
          var entry = entries[uuid];
          var type = entry[1];
          if (typeof type === "number") {
            entry[1] = assetTypes[type];
          }
        }
      }
    }

    var onStart = function () {
      cc.view.resizeWithBrowserSize(true);

      if (cc.sys.isMobile) {
        if (settings.orientation === "landscape") {
          cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
        } else if (settings.orientation === "portrait") {
          cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
        }
        // qq, wechat, baidu
        cc.view.enableAutoFullScreen(
          cc.sys.browserType !== cc.sys.BROWSER_TYPE_BAIDU &&
            cc.sys.browserType !== cc.sys.BROWSER_TYPE_WECHAT &&
            cc.sys.browserType !== cc.sys.BROWSER_TYPE_MOBILE_QQ
        );
      }

      cc.AssetLibrary.init({
        libraryPath: window.gameContentBasePath + "res/import",
        rawAssetsBase: window.gameContentBasePath + "res/raw-",
        rawAssets: settings.rawAssets,
        packedAssets: settings.packedAssets,
      });

      var launchScene = settings.launchScene;
      if (cc.runtime) {
        cc.director.setRuntimeLaunchScene(launchScene);
      }
      cc.director.loadScene(launchScene, null, function () {
        if (cc.sys.isBrowser) {
          var canvas = document.getElementById("GameCanvas");
          canvas.style.visibility = "";
          var div = document.getElementById("GameDiv");
          if (div) {
            div.style.backgroundImage = "";
          }
        }
      });
    };

    var jsList = settings.jsList;
    var bundledScript = settings.debug ? "project.dev.js" : "project.js";
    if (jsList) {
      jsList.push(bundledScript);
    } else {
      jsList = [bundledScript];
    }
    jsList = jsList.map(function (x) {
      return window.platformSrcDir + x + "?cbid=" + window.getCBID();
    });

    var option = {
      id: "GameCanvas",
      scenes: settings.scenes,
      debugMode: settings.debug ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
      showFPS: settings.debug,
      frameRate: 60,
      jsList: jsList,
      groupList: settings.groupList,
      collisionMatrix: settings.collisionMatrix,
      renderMode: 0,
    };

    cc.game.run(option, onStart);
  }

  if (window.document) {
    var cocos2d = document.createElement("script");
    cocos2d.async = true;
    cocos2d.src =
      window.platformSrcDir +
      (window._CCSettings.debug ? "cocos2d-js.js" : "cocos2d-js-min.js") +
      "?cbid=" +
      window.getCBID();

    var engineLoaded = function () {
      document.body.removeChild(cocos2d);
      cocos2d.removeEventListener("load", engineLoaded, false);
      boot();
    };
    cocos2d.addEventListener("load", engineLoaded, false);
    document.body.appendChild(cocos2d);
  }
})();
