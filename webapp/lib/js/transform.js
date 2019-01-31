const Matrix = require("transformation-matrix-js")
  .Matrix;

class Transform {
  static decodeDirection(dir) {
    switch (dir || "across") {
      case "across":
        return [1, 0, 0, 1];
      case "down":
        return [0, 1, 1, 0];
      default:
        throw new Error("Bad play direction: " + dir);
    }
  }

  constructor(cx, cy, dir) {
    if (cx === undefined) {
      this.m = new Matrix;
    } else if (cx instanceof Matrix) {
      this.m = cx;
    } else {
      const mat = Transform.decodeDirection(dir);
      this.m = Matrix.from(...mat, cx, cy);
    }
  }

  xy(x, y) {
    const pt = this.m.applyToPoint(x, y);
    return [pt.x, pt.y].map(Math.round);
  }

  get origin() {
    return this.xy(0, 0);
  }

  xys(list) {
    return list.map(xy => {
      const [x, y] = xy;
      return this.xy(x, y)
    });
  }

  recentre(x, y) {
    const [cx, cy] = this.xy(x, y);
    let m = this.m.clone();
    m.e = cx;
    m.f = cy;
    return new Transform(m);
  }

  get inverse() {
    return this._inverse = this._inverse ||
      new Transform(this.m.inverse());
  }

  get flipped() {
    if (this._flipped) return this._flipped;
    let m = this.m.clone();
    m.transform(0, 1, 1, 0, 0, 0);
    return this._flipped = new Transform(m);
  }
}

module.exports = Transform;
