"use strict";

const blackList = new Set(["constructor"]);
const whiteList = new Set(["_id"]);

class ObjectTools {

  static getReadable(obj) {
    const props = Object.getOwnPropertyDescriptors(obj);

    let readable = Object.entries(props)
      .filter(([name, desc]) => (whiteList.has(name) || name[0] !== "_") &&
        !blackList.has(name) &&
        (desc.enumerable || desc.get))
      .map(([name, desc]) => name);

    const proto = Object.getPrototypeOf(obj);

    if (proto && Object.getPrototypeOf(proto))
      readable.push(...this.getReadable(proto));

    return readable;
  }

  static getJSON(obj) {
    const props = this.getReadable(obj);
    let out = {};
    for (const prop of props)
      out[prop] = obj[prop];
    return out;
  }

}

module.exports = ObjectTools;
