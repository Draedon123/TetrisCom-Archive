// @ts-check

// should technically return HTMLIFrameElement | null but I don't want to deal
// with type coercions everywhere
function getIFrame() {
  return /** @type { HTMLIFrameElement } */ (
    document.getElementById("gameIFrame")
  );
}

function getIFrameWindow() {
  return /** @type { Window } */ (getIFrame()?.contentWindow);
}

function getIFrameDocument() {
  return /** @type { Document } */ (getIFrame()?.contentDocument);
}

function getGameCanvas() {
  return /** @type { HTMLCanvasElement } */ (
    getIFrameDocument()?.getElementById("GameCanvas")
  );
}

function getMBPSApp() {
  // @ts-expect-error
  return getIFrameWindow()?.mBPSApp;
}

function getMGameMgr() {
  return getMBPSApp()?.mSceneMgr.getManagedScene("game").mGameMgr;
}

export {
  getIFrame,
  getIFrameWindow,
  getIFrameDocument,
  getGameCanvas,
  getMBPSApp,
  getMGameMgr,
};
