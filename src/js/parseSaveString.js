// @ts-check

import { decode, encode } from "./encodeDecode.js";

const SCORE_KEYS = {
  MAIN: "defaultTPF",
  MAIN_MOBILE: "defaultTPF-mobile",
  MIND_BENDER: "project-MINDBENDER",
  MIND_BENDER_MOBILE: "project-MINDBENDER-mobile",
  E60: "E60",
  E60_MOBILE: "E60-mobile",
  NBLOX: "BPSTetrisGame-FTO-v1",
};

for (const [game, name] of Object.entries(SCORE_KEYS)) {
  /** @type { keyof SCORE_KEYS } */
  // @ts-expect-error game is obviously a key of SCORE_KEYS

  const key = game;

  SCORE_KEYS[key] = encode(name + "-highScores", -1);
  // console.log(key, encode(name, -1));
}

/**
 * @param { string } saveString
 * @returns { number[] }
 */
function parseSaveString(saveString) {
  if (saveString === "") {
    return [0];
  }

  const saveData = JSON.parse(decode(saveString));

  /** @type { number[] } */
  const scores = [];

  for (const value of Object.values(saveData[`#245514879`])) {
    const score = value["#1026088449@i"];

    scores.push(score);
  }

  return scores;
}

export { parseSaveString, SCORE_KEYS };
