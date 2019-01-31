"use strict";

let chai = require("chai");
let expect = chai.expect;

const ArrayPicker = require("../../webapp/lib/js/array-picker.js");

function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function fillRange(n) {
  let a = [];
  while (a.length < n) a.push(a.length);
  return a;
}

function collect(src, pick) {
  let out = [];
  let p = pick.slice();
  while (p.length)
    out.push(...src.splice(p.shift(), 1));
  return out;
}

function checkPick(original, idx, out, src) {
  it("should pick " + JSON.stringify(idx) +
    " from " + JSON.stringify(original), () => {
      expect(out)
        .to.deep.equal(idx);
    });

  const want = original.filter(x => idx.indexOf(x) < 0);
  it("should have left " + JSON.stringify(want), () => {
    expect(src)
      .to.deep.equal(want);
  });
}

function testPicker(count, func) {
  for (let tn = 0; tn < 10; tn++) {
    const srcLength = 1 + Math.floor(Math.random() * 25);
    const pickLength = Math.floor(Math.random() * srcLength);

    let src = fillRange(srcLength);
    let original = src.slice();
    let idx = shuffle(src.slice()).splice(0, pickLength);

    let out = func(src, idx);

    checkPick(original, idx, out, src);
  }
}

describe("ArrayPicker", () => {
  describe("adjustIndex", () => {
    testPicker(10, (src, idx) => {
      let pick = ArrayPicker.adjustIndex(idx);
      const rev = ArrayPicker.reverseIndex(pick);

      it("should be possible to reverse the index", () => {
        expect(rev).to.deep.equal(idx);
      });

      return collect(src, pick);
    });
  });
  describe("multiSplice", () => {
    testPicker(10, (src, idx) => {
      let pick = ArrayPicker.adjustIndex(idx);
      return ArrayPicker.multiSplice(src, pick);
    });
  });
  describe("pick", () => {
    testPicker(10, (src, idx) => {
      return ArrayPicker.pick(src, idx);
    });
  });
});
