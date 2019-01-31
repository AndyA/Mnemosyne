"use strict";

const mysql = require("mysql2");

module.exports = mysql.createPoolPromise({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mnemosyne4'
});
