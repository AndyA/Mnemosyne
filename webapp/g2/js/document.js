"use strict";

const _ = require("lodash");

const MnemosyneDocument = require("lib/js/mnemosyne/document");
const GV = require("lib/js/mnemosyne/versions");

class G2Document extends MnemosyneDocument {
  _checkVersions() {
    if (!this.versions) return;
    const versions = _.reverse(this.versions.slice(0));

    // Find old style versions
    const gv = versions.filter(
      v => v.old_data !== undefined
        || v.new_data !== undefined);

    if (gv.length === 0) {
      // All new style
    } else if (gv.length === this.versions.length) {
      // All mnemosyne style
      let doc = undefined;
      for (const v of versions) {
        if (doc !== undefined && !GV.sameValue(doc, v.new_data)) {
          const diff = GV.deepDiff(v.new_data, doc);
          console.log({
            doc,
            new_data: v.new_data,
            diff
          });
          throw new Error("New value / doc mismatch");
        }
        doc = v.old_data;
      }
    } else {
      throw new Error("Found a mix of G2 and G3 versions");
    }
  }

  getAllVersions() {
    this._checkVersions();
    let doc = this.mnemosyne;
    let ver = [{
      doc
    }];
    if (this.versions && this.versions.length) {
      const versions = _.reverse(this.versions.slice(0));
      for (const v of versions) {
        if (v.old_data !== undefined || v.new_data !== undefined) {
          // Old style Mnemosyne version. Just merge
          const oldDoc = GV.mergeDeep(doc, v.old_data);
          // Make a new style delta
          const delta = GV.deepDiff(oldDoc, doc);
          doc = oldDoc;

          let newVersion = Object.assign({}, v, {
            delta
          });

          delete newVersion.old_data;
          delete newVersion.new_data;

          ver.unshift({
            doc,
            v: newVersion
          });
        } else if (v.delta) {
          doc = GV.applyEdit(doc, v.delta.after, v.delta.before);
          ver.unshift({
            doc,
            v
          });
        } else {
          throw new Error("Funny looking version");
        }
      }
    }
    return ver;
  }
}

module.exports = G2Document;
