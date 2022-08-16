/**
 * Created by Loharano on 7/14/2017.
 */
const db = require('./db')
const env = require('../env/env')
const oracledb = require("oracledb")
const SHA1 = require("crypto-js/sha1");

class Be {
  constructor(be) {
    this.id = be.ID;
    this.flow_id = be.FLOW_ID;
    this.header = be.HEADER;
    this.sender = be.SENDER;
    this.receiver = be.RECEIVER;
    this.numero = be.NUMERO;
    this.observation = be.OBSERVATION;
    this.counts = be.COUNTS;
    this.hashed = be.HASHED;
    this.titles = be.TITLES;
    this.date = be.DATE;
  }
}

let beViewsToBe = function (arrayOfBe, next) {
  let bes = [];
  arrayOfBe.forEach(function (row) {
    let be = new Be(row);
    bes.push(be);
  });
  console.log(bes)
  next(bes)

};

let parse = (be) => {
  be.counts = be.counts.join(',');
  be.titles = be.titles.join(',');
  be.hashed = SHA1(be.flow_id.toString()).toString();

  return be
}


let save = (be, next) => {

  const query = `
  BEGIN
    INSERT_BE(
      :flow_id,
      :receiver,
      :sender,
      :titles,
      :counts,
      :hashed
    );
  END;`;
  console.log(be)
  db.execute(query, be, function () {
    next()
  })
}


//get project flows
const getBe = function (hashed = 21, next) {
  const query = "SELECT * FROM BE WHERE HASHED = '" + hashed + "'";
  db.executeNoBindReturnJson(query, beViewsToBe, next)
};

module.exports = {
  save: save,
  getBe: getBe,
  parse: parse
}
