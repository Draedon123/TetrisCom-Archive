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
