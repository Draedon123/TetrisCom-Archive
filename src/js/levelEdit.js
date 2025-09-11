function numFrom2Chars(r, n) {
  return r - 65 + 26 * (n - 65);
}

function _randomInt2(r, n) {
  return (
    0 == (r %= 16777215) && (r = 1),
    0 == (n %= 16777215) && (n = 1),
    ((((65535 & (n = 36969 * (65535 & n) + (n >>> 16))) << 16) & 2147483647) +
      (65535 & (r = 18e3 * (65535 & r) + (r >>> 16)))) &
      2147483647
  );
}

function forceSignedInt32(r) {
  return r > 2147483647 && (r = r - 2147483647 - 2147483648 - 1), ~~r;
}

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

function decode(n) {
  if (!n || "" == n) return "";
  var e,
    t,
    i = n.length,
    a = numFrom2Chars(n.charCodeAt(0), n.charCodeAt(1)),
    u = (i - 2) / 2;
  let r = "";
  for (var s = 1; s <= u; s++) {
    if (
      ((e = randomInt2(a, s - 1) % 420),
      (t = numFrom2Chars(n.charCodeAt(2 * s), n.charCodeAt(2 * s + 1)) - e) >
        255)
    )
      return "";
    if (t > 0) {
      r += String.fromCharCode(t);
    }
  }
  return r;
}

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

function nextNativeRandomIntInRange(n, e) {
  return n + (nextNativeRandomInt() % (e - n + 1));
}

function numTo2Chars_CharCode1(r) {
  return 65 + (r % 26);
}

function numTo2Chars_CharCode2(r) {
  return 65 + r / 26;
}

function encode(n, e) {
  if (!n || "" == n) return "";
  var t,
    i,
    a,
    u,
    s = n.length;
  t =
    e < 0
      ? stringToHash32(n) % 256
      : 0 == e
        ? nextNativeRandomIntInRange(0, 255)
        : e % 256;
  let r = "";
  r += String.fromCharCode(numTo2Chars_CharCode1(t));
  r += String.fromCharCode(numTo2Chars_CharCode2(t));
  for (var c = 0; c < s; c++)
    (i = randomInt2(t, c) % 420),
      (a = n.charCodeAt(c)) > 255 && (a = 0),
      (u = a + i),
      (r += String.fromCharCode(numTo2Chars_CharCode1(u))),
      (r += String.fromCharCode(numTo2Chars_CharCode2(u)));
  return r;
}

function inject(lockDelay) {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.requestURL = url;

    originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (!this.requestURL.includes("SJUNWRWEIRJFBRGPXFMNNQMLVRBKUFUT.txt")) {
      originalSend.bind(this)(body);

      return;
    }

    const originalOnreadystatechange = this.onreadystatechange;
    this.onreadystatechange = function () {
      if (
        this.readyState === XMLHttpRequest.DONE &&
        this.status >= 200 &&
        this.status < 300
      ) {
        const parsed = JSON.parse(decode(this.responseText));
        const levels =
          parsed.gameMgr.game.players["player-base"].playerComponents.levels
            .params.levels;

        for (const level of levels) {
          level["lockTimeMSEC@i"] = lockDelay;
        }

        levels[29].endCondition["targetValue@i"] = 2 ** 31 - 1;

        const encoded = encode(JSON.stringify(parsed), -1);
        Object.defineProperty(this, "responseText", {
          writable: true,
          value: encoded,
        });

        console.log(`Lock delay overrided to ${lockDelay}ms`);
        window.parent.document.body.style.backgroundColor = "#feffff";
      }
      originalOnreadystatechange?.apply(this, arguments);
    };

    originalSend.apply(this, arguments);
  };
}

const hashMatch = window.parent.location.hash.match(/lock=\d+/);

if (hashMatch !== null) {
  inject(parseInt(hashMatch[0].slice("lock=".length)));
}
