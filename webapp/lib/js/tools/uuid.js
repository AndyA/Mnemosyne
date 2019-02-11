"use strict";

const _ = require("lodash");
const md5 = require("md5");

class UUID {
  static validHash(hash) {
    return /^[0-9a-f]{32}$/.test(hash);
  }

  static valid(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      .test(uuid);
  }

  static _hash(uuid) {
    if (this.valid(uuid) || this.validHash(uuid))
      return uuid.replace(/-/g, "");

    throw new Error("Invalid UUID");
  }

  static hash(uuid) {
    return this._hash(uuid.toLowerCase());
  }

  static _format(hash) {
    if (this.valid(hash))
      return hash;

    if (this.validHash(hash))
      return [
        hash.substr(0, 8),
        hash.substr(8, 4),
        hash.substr(12, 4),
        hash.substr(16, 4),
        hash.substr(20, 12)
      ].join("-");

    throw new Error("Invalid hash");
  }

  static format(hash) {
    return this._format(hash.toLowerCase());
  }

  static toHash(id) {
    if (_.isArray(id))
      return id.map(i => this.toHash(i));

    if (this.valid(id))
      return this.hash(id);

    return id;
  }

  static toUUID(id) {
    if (_.isArray(id))
      return id.map(i => this.toUUID(i));

    if (this.validHash(id))
      return this.format(id);

    return id;
  }

  static make(kind, ...info) {
    if (info.length == 0)
      throw new Error("Missing hash info");

    return this.format(md5([kind, ...info].join(":")));
  }

  constructor(hash) {
    const me = this.constructor;
    this._hash = me.hash(hash);
    this._uuid = me.format(hash);
  }

  get hash() {
    return this._hash
  }

  get uuid() {
    return this._uuid
  }

  toString() {
    return this.uuid;
  }
}

module.exports = UUID;
