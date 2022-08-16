/**
 * Created by Loharano on 7/14/2017.
 */
const db = require('./db')
const oracledb = require("oracledb")
const projectModel = require("../models/project")
const userModel = require("../models/user")
const entityModel = require("../models/entity")
const flowModel = require("../models/flow")
const fileModel = require("../models/file")
const Rx = require('rxjs/Rx')
let message = new Rx.BehaviorSubject({})

class Message {

  constructor(message) {
    this.id = message.ID
    this.flow_id = message.FLOW_ID
    this.content = message.CONTENT
    this.date = message.DATE
    this.entity_id = message.ENTITY_ID
    this.n_depart = message.N_DEPART
    this.n_arrive = message.N_ARRIVE
    this.sender_entity_id = message.SENDER_ENTITY_ID
  }
}

let answerFlow = (message, next) => {
  let query = `
  BEGIN 
    ANSWER(
    :id,
    :in_flow_id,
    :in_content,
    :in_entity_id,    
    :sender_entity_id
    );
  END;`

  let bindVars = {
    id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT},
    in_flow_id: answer.flow_id,
    in_content: answer.content,
    in_entity_id: answer.entity_id,
    sender_entity_id: answer.sender_entity_id,
  }

  db.execute(query, bindVars, (result) => {
    let id = result.outBinds.id
    next(id)
  })
}



module.exports = {
  getFlowMessages: getFlowMessages,
  getMessages: getMessages,
  getMessage: getMessage,
  answerFlow: answerFlow,
}
