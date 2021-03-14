const Database = require('sqlite-async');
const dbname = 'abtest.sqlite';

Database.open(dbname).then(db => {
  Dates.init(db);
})
  .catch(err => console.error(err.message));

class Dates {
  static db;
  static init(db) {
    Dates.db = db;
  };

  static all() {
    return Dates.db.all('SELECT * FROM dates ORDER BY regdate');
  }

  static create(data) {
    const sql = `INSERT OR REPLACE INTO dates(userid, regdate, lastdate) VALUES(?, ?, ?)`;
    return Dates.db.run(sql, data.userid, data.regdate, data.lastdate);
  }

  static rollingRetention(xday) {
    const sql = `
SELECT count(*) AS regs, count(iif(date(lastdate, 'unixepoch', '-${xday} day') >= date(regdate, 'unixepoch') , 1, null)) AS rets
FROM dates WHERE date(regdate, 'unixepoch', 'localtime') <= date('now', '-${xday} day')
    `;
    return Dates.db.get(sql);
  }

  static deleteAll() {
    return Dates.db.run('DELETE FROM dates');
  }
}

module.exports = Dates;
