// @ts-check

const SCORE_KEYS = {
  MAIN: "IDCMEQCIUDPIHUMSFECQPDROFEXMSIQGYMZQYJMRMJXF",
  MAIN_MOBILE: "BBOQMEOMGIBNPIUGRIKEBIZCWIPRZMDLJSJFWLKFCOXJFHDOESDLDHBKIM",
  MIND_BENDER: "JJMPZSJLHSZFYRWPQFXSQGYNZQKJKFQDHPTSVGVMPHRTWQKNCLFESQGUQPFU",
  MIND_BENDER_MOBILE:
    "KCAPDTXKFHLKGGUEEFBTEGKSXFWNWJCIVOTCHLHRGMFIPFXRDRTIMCUISEBIPKRFKFXRHFLNWJ",
};

/**
 * @param { string } saveString
 * @returns { number[] }
 */
function parseSaveString(saveString) {
  if (saveString === "") {
    return [0];
  }

  let parsed = "";
  const a = numberFrom2Characters(
    saveString.charCodeAt(0),
    saveString.charCodeAt(1)
  );

  for (let s = 1; s <= saveString.length / 2 - 1; s++) {
    const t =
      numberFrom2Characters(
        saveString.charCodeAt(2 * s),
        saveString.charCodeAt(2 * s + 1)
      ) -
      (randomInt2(a, s - 1) % 420);

    parsed += String.fromCharCode(t);
  }

  const saveData = JSON.parse(parsed);

  /** @type { number[] } */
  const scores = [];

  for (const value of Object.values(saveData[`#245514879`])) {
    const score = value["#1026088449@i"];

    scores.push(score);
  }

  return scores;
}

/**
 * @param { number } a
 * @param { number } b
 * @returns { number }
 */
function numberFrom2Characters(a, b) {
  return a - 65 + 26 * (b - 65);
}

/**
 * @param { number } a
 * @param { number } b
 * @returns { number }
 */
function randomInt2(a, b) {
  let c = (a %= 16777215) + (b %= 16777215);
  let d = 15449471 + b;
  let e = a - b;
  let f = 11366743 - b;
  let g = _randomInt2(c, d);
  let h = forceSignedInt32(g + b);
  let i = _randomInt2(e, f);
  let j = forceSignedInt32(i - b);
  return _randomInt2(h, j);
}

/**
 * @param { number } a
 * @param { number } b
 * @returns { number }
 */
function _randomInt2(a, b) {
  return (
    0 == (a %= 16777215) && (a = 1),
    0 == (b %= 16777215) && (b = 1),
    ((((65535 & (b = 36969 * (65535 & b) + (b >>> 16))) << 16) & 2147483647) +
      (65535 & (a = 18e3 * (65535 & a) + (a >>> 16)))) &
      2147483647
  );
}

/**
 * @param { number } n
 * @returns { number }
 */
function forceSignedInt32(n) {
  return n > 2147483647 && (n = n - 2147483647 - 2147483648 - 1), ~~n;
}

export { parseSaveString, SCORE_KEYS };
