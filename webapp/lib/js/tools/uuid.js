"use strict";

const _ = require("lodash");
const md5 = require("md5");

class UUID {
  static valid_hash(hash) {
    return /^[0-9a-f]{32}$/.test(hash);
  }

  static valid(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      .test(uuid);
  }

  static _hash(uuid) {
    if (UUID.valid(uuid) || UUID.valid_hash(uuid))
      return uuid.replace(/-/g, "");

    throw new Error("Invalid UUID");
  }

  static hash(uuid) {
    return UUID._hash(uuid.toLowerCase());
  }

  static _format(hash) {
    if (UUID.valid(hash))
      return hash;

    if (UUID.valid_hash(hash))
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
    return UUID._format(hash.toLowerCase());
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

    if (this.valid_hash(id))
      return this.format(id);

    return id;
  }

  static make(kind, ...info) {
    if (info.length == 0)
      throw new Error("Missing hash info");

    return UUID.format(md5([kind, ...info].join(":")));
  }

  constructor(hash) {
    this._hash = UUID.hash(hash);
    this._uuid = UUID.format(hash);
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
