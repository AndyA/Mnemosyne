"use strict";

const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const db = new PouchDB('http://localhost:5984/mnemosyne', {
  auth: {
    username: "mnemosyne",
    password: "f7a49ad9-a6a8-40d2-9447-8c9697a37312"
  }
});

db.info()
  .then(info => console.log(info))
  .catch(err => console.log("Error:", err));
