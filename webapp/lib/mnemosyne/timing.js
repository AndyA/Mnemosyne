"use strict";

class MnemosyneTiming {
  constructor(timing) {
    this.timing = timing;
  }

  get start() {
    return this._start = this._start || new Date(this.timing.start);
  }

  get end() {
    return this._end = this._end || (() => {
      if (this.timing.end)
        return new Date(this.timing.end);
      return this.start;
    })();
  }

  get duration() {
    return this.end - this.start;
  }

  get busyBefore() {
    if (this.timing.busy)
      return this.timing.busy.before || 0;
    return 0;
  }

  get busyAfter() {
    if (this.timing.busy)
      return this.timing.busy.after || 0;
    return 0;
  }

  get busyStart() {
    return this._busyStart = this._busyStart
    || new Date(this.start.getTime() - this.busyBefore * 60 * 1000);
  }

  get busyEnd() {
    return this._busyEnd = this._busyEnd
    || new Date(this.end.getTime() + this.busyAfter * 60 * 1000);
  }

  get busyDuration() {
    return this.busyEnd - this.busyStart
  }

}

module.exports = MnemosyneTiming;

