// @ts-check

/**
 * @typedef { keyof T } Keys<T>
 * @template { any } T
 */

import { decode, encode } from "../../js/encodeDecode.js";
import { getMGameMgr } from "./getElements.js";
import { CONTROLS, INPUT_IDS, KEY_MAP } from "./keyCodeMap.js";

// idk what's going on here, there's so much mapping to be done
function updateControls() {
  const mGameMgr = getMGameMgr();

  const controls = JSON.parse(
    decode(
      localStorage.getItem(encode("E60-versus-options", -1)) ?? encode("{}", -1)
    )
  );

  /** @type { Map<keyof typeof import("./keyCodeMap").CONTROLS, keyof typeof import("./keyCodeMap").KEY_MAP> } */
  const moveToKeyName = new Map();

  for (const control of /** @type {(keyof typeof import("./keyCodeMap").CONTROLS)[]} */ (
    Object.keys(CONTROLS)
  )) {
    moveToKeyName.set(
      control,
      controls.player1[`controls_${control}`].slice("Keyboard.".length)
    );
  }

  const playerControlsMap =
    mGameMgr.mGame.mPlayers.mObjects[0].mControlComponent.mInputMgr.getDeviceControlsMap(
      174492184
    ).mValues.mObjects;

  const serverControlsMap =
    mGameMgr.mGame.mPlayers.mObjects[1].mControlComponent.mInputMgr.getDeviceControlsMap(
      174492184
    ).mValues.mObjects;

  for (const control of serverControlsMap) {
    // effectively remove server keybinds
    control.mKey = -1;
  }

  for (const [
    control,
    controlKey,
  ] of /** @type {[keyof typeof import("./keyCodeMap").INPUT_IDS, typeof import("./keyCodeMap").INPUT_IDS[keyof typeof import("./keyCodeMap").INPUT_IDS]][]} */ (
    Object.entries(INPUT_IDS)
  )) {
    const keyName =
      /** @type { keyof typeof import("./keyCodeMap").KEY_MAP } */ (
        moveToKeyName.get(control)
      );
    // @ts-expect-error
    playerControlsMap.find((object) => object.mValue === controlKey).mKey =
      KEY_MAP[keyName];
  }
}

export { updateControls };
