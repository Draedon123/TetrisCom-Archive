var isIFrame = window.frameElement && window.frameElement.nodeName == "IFRAME";
if (true && !isIFrame) {
  window.location.replace(
    window.location.protocol + "//" + window.location.hostname
  );
} else {
  var pageStartTimeMSEC = Date.now();
  var cbidg = "698B044815E60783";
  var gameDiv = document.getElementById("GameDiv");
  var gameCanvas = document.getElementById("GameCanvas");

  //----------------------------------------------------------------

  window.axGAFGHTML_didOnReadyTimeout = false;
  onReadyElapsedTimeSEC = 0;
  var onReadyTimeoutInterval = setInterval(function () {
    onReadyElapsedTimeSEC++;
    var onReadyTimeoutLimitSEC = 5;
    var isReady;
    if (false) {
      isReady = onReadyElapsedTimeSEC > onReadyTimeoutLimitSEC;
    } else {
      isReady =
        onReadyElapsedTimeSEC > onReadyTimeoutLimitSEC && window.mBPSApp;
    }
    if (isReady) {
      clearInterval(onReadyTimeoutInterval);
      axGAFGHTML5_onReadyTimeout();
    }
  }, 1000);

  window.adsbygoogle = window.adsbygoogle || [];
  var adBreak = (adConfig = function (o) {
    adsbygoogle.push(o);
  });
  adConfig({
    preloadAdBreaks: "on",
    onReady: () => {
      clearInterval(onReadyTimeoutInterval);
      if (!window.axGAFGHTML_didOnReadyTimeout) {
        showGameAreaAd("preroll");
      }
    },
  });

  //----------------------------------------------------------------

  if (false) {
    function UnityProgress(gameInstance, progress) {
      if (progress == 1) {
        removeLoadingDisplay();
      }
    }
    var UnityGameInstance = UnityLoader.instantiate(
      "GameDiv",
      "%UNITY_WEBGL_BUILD_URL%",
      { onProgress: UnityProgress }
    );
  }

  //----------------------------------------------------------------

  function openURL(pURL, pTargetNewWindow) {
    try {
      window.parent.open(pURL, pTargetNewWindow ? "_blank" : "_self");
    } catch (e) {}
  }

  function getPageElapsedTimeMSEC() {
    return isIFrame
      ? window.parent.getPageElapsedTimeMSEC()
      : Date.now() - pageStartTimeMSEC;
  }

  function TGREAIGRIMZPFHREXNXJUMGJNGRPCNDK() {
    return isIFrame ? window.parent.TGREAIGRIMZPFHREXNXJUMGJNGRPCNDK() : 0;
  }

  function PCDFCJSRUMBRFNRKJOJKWNSJNMNFONFLPFTKYSBKDT() {
    return isIFrame
      ? window.parent.PCDFCJSRUMBRFNRKJOJKWNSJNMNFONFLPFTKYSBKDT()
      : 0;
  }

  function getCBID() {
    return cbidg;
  }

  function getGameDiv() {
    if (gameDiv == null) {
      gameDiv = document.getElementById("GameDiv");
    }
    return gameDiv;
  }

  function getGameCanvas() {
    if (gameCanvas == null) {
      gameCanvas = document.getElementById("GameCanvas");
    }
    return gameCanvas;
  }

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  function gameLoadingSceneIsReady() {
    try {
      removeLoadingDisplay();
    } catch (e) {}
  }

  function removeLoadingDisplay() {
    var loadingText = document.getElementById("loadingText");
    if (loadingText) {
      loadingText.parentNode.removeChild(loadingText);
    }
    var loadingDisplay = document.getElementById("loadingDisplay");
    if (loadingDisplay) {
      loadingDisplay.parentNode.removeChild(loadingDisplay);
    }
  }

  function trackGUAEvent(
    category,
    action,
    opt_label,
    opt_value,
    opt_noninteraction
  ) {
    if (isIFrame) {
      try {
        window.parent.trackGUAEvent(
          category,
          action,
          opt_label,
          opt_value,
          opt_noninteraction
        );
      } catch (e) {}
    }
  }

  if (true) {
    function trackGA4PageEvent(pEventName, pParameters) {
      if (isIFrame) {
        try {
          window.parent.trackGA4PageEvent(pEventName, pParameters);
        } catch (e) {}
      }
    }
    function trackGA4GameEvent(pEventName, pParameters) {
      if (isIFrame) {
        try {
          window.parent.trackGA4GameEvent(pEventName, pParameters);
        } catch (e) {}
      }
    }
  } else if (false) {
    function trackGA4PageEvent(pEventName, pParameters) {
      if (isIFrame) {
        try {
          window.parent.trackGA4PageEvent(pEventName, JSON.parse(pParameters));
        } catch (e) {}
      }
    }
    function trackGA4GameEvent(pEventName, pParameters) {
      if (isIFrame) {
        try {
          window.parent.trackGA4GameEvent(pEventName, JSON.parse(pParameters));
        } catch (e) {}
      }
    }
  }

  function refreshAds() {
    if (isIFrame) {
      window.parent.refreshAds();
    }
  }

  function isGameAreaAdEnabled() {
    return isIFrame ? window.parent.canShowAds : false;
  }

  function isGameAreaAdActive() {
    return isIFrame ? window.parent.isGameAreaAdActive : false;
  }

  function showGameAreaAd(pType = "next") {
    if (true) {
      try {
        switch (pType) {
          case "preroll":
            adBreak({
              type: pType,
              name: "AD_NAME",
              adBreakDone: axGAFGHTML5_axBreakDone,
            });
            break;
          case "next":
          default:
            window.parent.showGameAreaAd();
            adBreak({
              type: pType,
              name: "AD_NAME",
              beforeAd: axGAFGHTML5_beforeAx,
              afterAd: axGAFGHTML5_afterAx,
              adBreakDone: axGAFGHTML5_axBreakDone,
            });
            break;
        }
      } catch (e) {
        console.log("e = " + e);
      }
    } else {
      if (isIFrame) {
        window.parent.showGameAreaAd();
      }
    }
  }

  function onGameAreaAdComplete() {
    var onGameAreaAdCompleteInterval = setInterval(function () {
      try {
        if (true) {
          if (window.mBPSApp) {
            clearInterval(onGameAreaAdCompleteInterval);
            window.parent.document.activeElement.blur();
            window.parent.document.getElementById("gameIFrame").focus();
            document.activeElement.blur();
            document.getElementById("GameCanvas").focus();
            window.mBPSApp.dispatchAppMessage(979287055);
          }
        } else if (false) {
          UnityGameInstance.SendMessage(
            "BPSTUWPI",
            "dispatchMessage",
            "979287055"
          );
          clearInterval(onGameAreaAdCompleteInterval);
          window.parent.document.activeElement.blur();
          window.parent.document.getElementById("gameIFrame").focus();
          document.activeElement.blur();
        }
      } catch (e) {}
    }, 100);
  }

  //----------------------------------------------------------------
  //-- GAFGHTML5:

  function axGAFGHTML5_beforeAx() {}

  function axGAFGHTML5_afterAx() {}

  function axGAFGHTML5_axBreakDone(pPlacementInfo) {
    switch (pPlacementInfo.breakStatus) {
      case "timeout":
        trackGUAEvent("Game Page", "ads_google_h5", "system_timeout", 0, true);
        trackGA4PageEvent("ads_google_h5__system_timeout", {});
        break;

      case "dismissed":
        trackGUAEvent("Game Page", "ads_google_h5", "ad_skipped", 0, true);
        trackGA4PageEvent("ads_google_h5__ad_skipped", {});
        break;

      case "viewed":
        trackGUAEvent("Game Page", "ads_google_h5", "ad_complete", 0, true);
        trackGA4PageEvent("ads_google_h5__ad_complete", {});
        break;

      default:
        trackGUAEvent("Game Page", "ads_google_h5", "no_ad_delivered", 0, true);
        trackGA4PageEvent("ads_google_h5__no_ad_delivered", {});
        break;
    }
    window.parent.onGameAreaAdComplete();
  }

  function axGAFGHTML5_onReadyTimeout() {
    trackGUAEvent("Game Page", "ads_google_h5", "system_timeout", 0, true);
    trackGA4PageEvent("ads_google_h5__system_timeout", {});
    axGAFGHTML_didOnReadyTimeout = true;
    window.parent.onGameAreaAdFailed();
  }

  //----------------------------------------------------------------
}
