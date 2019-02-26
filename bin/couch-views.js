"use strict";

const _ = require("lodash");
const PouchDB = require("pouchdb");
const config = require("config");

const design = {
  main: {
    language: 'javascript',
    views: {
      broadcastsByEpisode: {
        map: function(doc) {
          if (doc.episodeID)
            emit(doc.episodeID, null);
        },
        reduce: "_count"
      },
      broadcastsByServiceDate: {
        map: function(doc) {
          if (doc.broadcast) {
            emit([
              doc.broadcast.service[0].$.sid,
              doc.broadcast.published_time[0].$.start,
              0
            ], null);

            if (doc.episodeID) {
              emit([
                doc.broadcast.service[0].$.sid,
                doc.broadcast.published_time[0].$.start,
                1
              ], {
                _id: doc.episodeID
              });
            }
          }
        }
      },
      genres: {
        map: function(doc) {
          if (doc.episode && doc.episode.genres) {
            var gg = doc.episode.genres.genre_group;
            for (var i = 0; i < gg.length; i++) {
              emit(gg[i].genre_id, null);
            }
          }
        },
        reduce: "_count"
      },
      kinds: {
        map: function(doc) {
          if (doc.kind)
            emit(doc.kind, null);
        },
        reduce: "_count"
      },
      pidOrID: {
        map: function(doc) {
          function emitWithEpisode(id) {
            emit([id, 0], null);
            if (doc.episodeID) {
              emit([id, 1], {
                _id: doc.episodeID
              });
            }
          }
          emitWithEpisode(doc._id);
          if (doc.pid)
            emitWithEpisode(doc.pid);
        }
      }
    }
  }
}

class CouchDesign {
  constructor(name, doc) {
    this.name = name;
    this.doc = doc;
  }

  static objMap(obj, fn) {
    let out = {};
    for (const key of Object.keys(obj))
      out[key] = fn(obj[key]);
    return out;
  }

  static codeToString(obj) {
    if (_.isFunction(obj))
      return obj.toString();

    if (_.isArray(obj))
      return obj.map(i => this.codeToString(i));

    if (_.isObject(obj))
      return this.objMap(obj, i => this.codeToString(i));

    return obj;
  }

  get id() {
    return "_design/" + this.name;
  }

  toJSON() {
    const obj = Object.assign({}, this.doc, {
      _id: this.id
    });
    return this.constructor.codeToString(obj);
  }
}

function clean(doc) {
  let out = Object.assign({}, doc);
  delete out._id;
  delete out._rev;
  return out;
}

function sameDoc(da, db) {
  return JSON.stringify(clean(da)) === JSON.stringify(clean(db));
}

async function updateDesign(db, design) {
  for (const docName of Object.keys(design)) {
    const cd = new CouchDesign(docName, design[docName]);

    const oldDD = await db.get(cd.id).catch(err => {
      if (err.name === "not_found")
        return null;
      throw err;
    });

    let newDD = cd.toJSON();

    if (oldDD) {
      if (sameDoc(oldDD, newDD)) {
        console.log("Skipping unchanged " + cd.id);
        return;
      }
      newDD._rev = oldDD._rev;
    }

    await db.put(newDD);
    console.log("Updated " + cd.id);
  }
}

const db = new PouchDB(Object.assign({}, config.get("db")));

updateDesign(db, design)
  .catch(err => {
    console.log(err)
  })
  .finally(() => db.close(() => {
  }));
