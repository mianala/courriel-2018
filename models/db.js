/**
 * Created by Loharano on 7/12/2017.
 */
"use strict"
const Rx = require('rxjs/Rx')
const env = require('../env/env')
let oracledb = require("oracledb")
oracledb.fetchAsString = [oracledb.CLOB];
let message = new Rx.BehaviorSubject({event:'',participants:[]})

let poolMap = {};
let connectionAttributes = env.oracleConnectionAttribute

let options =
  {
    outFormat: oracledb.OBJECT,
    maxRows: 110000,
    autoCommit: true
  }

let createPool = (poolName) => {
  oracledb.createPool(
    connectionAttributes,
    function (err, p) {
      if (err) throw err;

      poolMap[poolName] = p;

    }
  );
}

let getPool = (poolName) => {
  return poolMap[poolName];
}


let execute = function (query, bindVars, callback) {


  getPool(global.mainPool).getConnection(function (err, connection) {
    if (err) {
      console.log(err.message)
    }
    if (connection) {
      connection.execute(query, bindVars, options, function (err, result) {
        release(connection)
        if (err) {
          console.log(err.message)
        } else {
          callback(result)
        }
      })
    }
  })
}

let executeNoBind = function (query, callback) {
  getPool(global.mainPool).getConnection(function (err, connection) {
    if (connection) {
      connection.execute(query, [], options, function (err, result) {
        release(connection)
        if (err) {
          console.log(query)
          console.log(err.message)
        } else {
          callback(result)
        }
      })
    }
  })
}

let executeNoBindReturnJson = function (query, process, next) {
  executeNoBind(query, function (result) {
    let db_result = result.rows
    if (result.rows.length === 0) {
      next([])
    } else {
      process(db_result, result => {
        next(result)
      })
    }
  })
}


const release = function (conn) {
  conn.close(function (err) {
    if (err)
      console.error(err.message)
  })
}

module.exports = {
  connectionAttibutes: connectionAttributes,
  execute: execute,
  executeNoBind: executeNoBind,
  message: message,
  release: release,
  createPool: createPool,
  executeNoBindReturnJson: executeNoBindReturnJson
}
