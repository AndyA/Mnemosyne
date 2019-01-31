"use strict";

const chai = require("chai");
const expect = chai.expect;

const Transform = require("../../webapp/lib/js/transform.js")

const testPos = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, -1],
  [-1, 0],
  [1, 0],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [200, -3],
  [11, 11],
  [-1, 1000]
];

function offsetPairs(list, dx, dy) {
  return list.map(xy => {
    const [x, y] = xy;
    return [x + dx, y + dy];
  });
}

function scale(list, sx, sy) {
  return list.map(xy => {
    const [x, y] = xy;
    return [x * sx, y * sy]
  });
}

function swapPairs(list) {
  return list.map(xy => {
    const [x, y] = xy;
    return [y, x]
  });
}

function testTransform(t, src, want) {
  const got = t.xys(src);
  // console.log({ src, want, got });
  expect(got)
    .to.deep.equal(want);
  expect(t.inverse.xys(want))
    .to.deep.equal(src);
}

describe("Transform", () => {
  describe("identity", () => {
    describe("implicit identity", () => {
      const t = new Transform();
      it("should not change coordinates", () => {
        testTransform(t, testPos, testPos);
      });
    });

    describe("explicit identity", () => {
      const t = new Transform(0, 0, "across");
      it("should not change coordinates", () => {
        testTransform(t, testPos, testPos);
      });
    });

    describe("origin", () => {
      const t = new Transform(3, 4, "across");
      it("should have the right origin", () => {
        expect(t.origin)
          .to.deep.equal([3, 4]);
      });
      it("should offset coordinates", () => {
        testTransform(t, testPos, offsetPairs(testPos, 3, 4));
      });
    });

    describe("flipped (constructor)", () => {
      const t = new Transform(7, 2, "down");
      it("should flip coordinates", () => {
        testTransform(t, testPos, offsetPairs(swapPairs(testPos),
          7, 2));
      });
    });

    describe("flipped (version)", () => {
      const t = new Transform(3, 4, "across")
        .flipped;
      it("should have the right origin", () => {
        expect(t.origin)
          .to.deep.equal([3, 4]);
      });
      it("should flip coordinates", () => {
        testTransform(t, testPos, offsetPairs(swapPairs(testPos),
          3, 4));
      });
    });

    describe("recentre", () => {

      it("should accumulate", () => {
        let t = new Transform(0, 0, "across");
        let o = [t.origin];
        for (const delta of [10, -10]) {
          for (let i = 0; i < 2; i++) {
            t = t.recentre(delta, 0);
            o.push(t.origin);
            t = t.flipped;
          }
        }
        expect(o)
          .to.deep.equal([
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
          ])
      });
    });
  });
});
