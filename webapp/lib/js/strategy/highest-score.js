"use strict";

class HighestScore {
  findPlays(turn) {
    function comparePlays(a, b) {
      return a.score - b.score ||
        a.word.localeCompare(b.word);
    }

    let plays = turn.possiblePlays;
    plays.sort(comparePlays);
    return plays;
  }
}

module.exports = HighestScore;
