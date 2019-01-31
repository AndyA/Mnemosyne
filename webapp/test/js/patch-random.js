const sinon = require("sinon");
const _ = require("lodash");

let currentSeed = 1;
let patched = false;

function patchRandom(seed) {

  currentSeed = seed;

  if (patched)
    return;

  sinon.stub(Math, 'random')
    .callsFake(() => {
      var r = Math.sin(currentSeed) * 10000;
      return currentSeed = r - Math.floor(r);
    });

  // lodash has its own localised Math so we need to
  // patch its shuffle method too.
  sinon.stub(_, 'shuffle')
    .callsFake(array => {
      const length = array == null ? 0 : array.length
      if (!length) {
        return []
      }
      let index = -1
      const lastIndex = length - 1
      const result = array.slice();
      while (++index < length) {
        const rand = index + Math.floor(Math.random() * (lastIndex - index +
          1))
        const value = result[rand]
        result[rand] = result[index]
        result[index] = value
      }
      return result

    });

  patched = true;
}

module.exports = patchRandom;
