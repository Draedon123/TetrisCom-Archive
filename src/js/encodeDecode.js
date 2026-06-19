// @ts-check

/**
 *
 * @param { number } r
 * @param { number } n
 * @returns { number }
 */
function numFrom2Chars(r, n) {
  return r - 65 + 26 * (n - 65);
}

/**
 *
 * @param { number } r
 * @param { number } n
 * @returns { number }
 */
function _randomInt2(r, n) {
  return (
    0 == (r %= 16777215) && (r = 1),
    0 == (n %= 16777215) && (n = 1),
    ((((65535 & (n = 36969 * (65535 & n) + (n >>> 16))) << 16) & 2147483647) +
      (65535 & (r = 18e3 * (65535 & r) + (r >>> 16)))) &
      2147483647
  );
}

/**
 *
 * @param { number } r
 * @returns { number }
 */
function forceSignedInt32(r) {
  return (r > 2147483647 && (r = r - 2147483647 - 2147483648 - 1), ~~r);
}

/**
 *
 * @param { number } n
 * @param { number } e
 * @returns { number }
 */
function randomInt2(n, e) {
  var t = (n %= 16777215) + (e %= 16777215),
    i = 15449471 + e,
    a = n - e,
    u = 11366743 - e,
    s = _randomInt2(t, i),
    c = forceSignedInt32(s + e),
    o = _randomInt2(a, u),
    g = forceSignedInt32(o - e);
  return _randomInt2(c, g);
}

/**
 *
 * @param { string } r
 * @returns { number }
 */
function stringToHash32(r) {
  if ("" != r) {
    for (var n = 44017, e = r.length, t = 0; t < e; t++)
      n = r.charCodeAt(t) + (n << 6) + (n << 16) - n;
    return (n &= 2147483647);
  }
  return 0;
}

function nextNativeRandomInt() {
  return ~~(2147483647 * Math.random());
}

/**
 *
 * @param { number } n
 * @param { number } e
 * @returns { number }
 */
function nextNativeRandomIntInRange(n, e) {
  return n + (nextNativeRandomInt() % (e - n + 1));
}

/**
 *
 * @param { number } r
 * @returns { number }
 */
function numTo2Chars_CharCode1(r) {
  return 65 + (r % 26);
}

/**
 *
 * @param { number } r
 * @returns { number }
 */
function numTo2Chars_CharCode2(r) {
  return 65 + r / 26;
}

/**
 *
 * @param { string } text
 * @returns { string }
 */
function decode(text) {
  if (!text || "" == text) return "";
  var e,
    t,
    i = text.length,
    a = numFrom2Chars(text.charCodeAt(0), text.charCodeAt(1)),
    u = (i - 2) / 2;
  let r = "";
  for (var s = 1; s <= u; s++) {
    if (
      ((e = randomInt2(a, s - 1) % 420),
      (t =
        numFrom2Chars(text.charCodeAt(2 * s), text.charCodeAt(2 * s + 1)) - e) >
        255)
    )
      return "";
    if (t > 0) {
      r += String.fromCharCode(t);
    }
  }
  return r;
}

/**
 *
 * @param { string } text
 * @param { number } key
 * @returns { string }
 */
function encode(text, key) {
  if (!text || "" == text) return "";
  var t,
    i,
    a,
    u,
    s = text.length;
  t =
    key < 0
      ? stringToHash32(text) % 256
      : 0 == key
        ? nextNativeRandomIntInRange(0, 255)
        : key % 256;
  var r = "";
  r += String.fromCharCode(numTo2Chars_CharCode1(t));
  r += String.fromCharCode(numTo2Chars_CharCode2(t));
  for (var c = 0; c < s; c++)
    ((i = randomInt2(t, c) % 420),
      (a = text.charCodeAt(c)) > 255 && (a = 0),
      (u = a + i),
      (r += String.fromCharCode(numTo2Chars_CharCode1(u))),
      (r += String.fromCharCode(numTo2Chars_CharCode2(u))));
  return r;
}

export { encode, decode };
