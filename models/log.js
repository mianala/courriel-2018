const db = require('./db');

const log = (info) => {
  const query = `
    INSERT INTO TABLE_LOG (${info.level}, ${info.message}, SYSDATE)
  `;
  db.executeNoBind(query, () => {})
}

module.exports = {
  log: log
}