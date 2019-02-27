"use strict";

const Promise = require("bluebird");
const assert = require("assert");

// Retrieve a (possibly huge) view in multiple pages using the approach here:
// http://docs.couchdb.org/en/2.2.0/ddocs/views/pagination.html#paging-alternate-method

class Pager {
  constructor(db, params) {
    this.db = db;

    this.params = Object.assign({
      page_size: 1000
    }, params);

    this.pageSize = this.params.page_size;
    this.limit = this.params.limit;

    assert(this.pageSize > 0, "page_size must be > 0");

    delete this.params.page_size;
    delete this.params.limit;

    this.next = {};
  }

  nextPage() {
    let limit = this.pageSize + 1;

    // Impose caller's limit if any
    if (this.limit !== undefined && this.limit < limit)
      limit = this.limit;

    // Exhausted?
    if (this.next === null || limit === 0)
      return Promise.resolve({
        rows: []
      });

    const params = Object.assign({}, this.params, this.next, {
      limit
    });

    return this.getPage(params).then(data => {
      let rows = data.rows;
      if (rows.length === this.pageSize + 1) {
        // Got a full page + peek at next
        const next = rows.pop();
        this.next = {
          startkey: next.key,
          startkey_docid: next.id
        }
      } else {
        // Incomplete fetch so no more after this
        this.next = null;
      }

      // Count rows if we're tracking the limit
      if (this.limit !== undefined)
        this.limit -= rows.length;

      return data;
    });
  }
}

class PageAll extends Pager {
  getPage(params) {
    return this.db.list(params);
  }
}

class PageView extends Pager {
  constructor(db, designName, viewName, params) {
    super(db, params);
    this.designName = designName;
    this.viewName = viewName;
  }

  getPage(params) {
    return this.db.view(this.designName, this.viewName, params);
  }
}

module.exports = {
  Pager,
  PageAll,
  PageView
};
