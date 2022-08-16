/**
 * Created by Loharano on 7/14/2017.
 */
const db = require('./db');
const file = require("../models/file");
const oracledb = require("oracledb");
const logger = require('../controllers/log').logger

class Flow {
  constructor(flow) {
    this.id = flow.ID;
    this.type_id = flow.TYPE_ID;
    this.be = flow.BE;
    this.thread_id = flow.THREAD_ID;
    this.content = flow.CONTENT;
    this.sender = flow.SENDER;
    this.objet = flow.OBJET;
    this.entity = flow.ENTITY;
    this.entity_id = flow.ENTITY_ID;
    this.entity_label = flow.ENTITY_LABEL;
    this.n_arrive = flow.N_ARRIVE;
    this.date = flow.DATE;
    this.user_id = flow.USER_ID;
    this.sender_entity = flow.SENDER_ENTITY;
    this.sender_entity_id = flow.SENDER_ENTITY_ID;
    this.sender_header = flow.SENDER_HEADER;
    this.sender_entity_label = flow.SENDER_ENTITY_LABEL;
    this.n_depart = flow.N_DEPART;
    this.original_date = flow.ORIGINAL_DATE;
    this.n_entity_created = flow.N_ENTITY_CREATED;
    this.destination = flow.DESTINATION;
    this.status_id = flow.STATUS_ID;
    this.project_id = flow.PROJECT_ID;
    this.project_title = unescape(flow.PROJECT_TITLE);
    this.project_ref = flow.PROJECT_REF ? unescape(flow.PROJECT_REF) : flow.PROJECT_REF;
    this.project_n = flow.PROJECT_N;
    this.project_numero = flow.PROJECT_NUMERO;
    this.project_sender = flow.PROJECT_SENDER;
    this.numero = flow.NUMERO;
    this.entity_title = flow.ENTITY_TITLE;
    this.sender_title = flow.SENDER_TITLE;
    this.sender_be_header = flow.SENDER_BE_HEADER
  }
}

const flowsViewToFlows = function (array, next) {
  let flows = [];
  if (array) {
    array.forEach(function (row) {
      const flow = new Flow(row);
      // todo: optimize later, put get flow files in frontend
      flows.push(flow);

      if (flows.length === array.length) {
        next(flows)
      }
    })
  }
};


// get flows
const getLatestFlows = function (entity_id = 21, next) {
  const query = "SELECT * FROM(SELECT * FROM FLOWS WHERE ENTITY_ID = " + entity_id + " OR SENDER_ENTITY_ID = " + entity_id + " ORDER BY ID DESC) WHERE ROWNUM <= 300";
  db.executeNoBindReturnJson(query, flowsViewToFlows, next)
};

// get flows
const getAllFlows = function (entity_id = 21, next) {
  const query = "SELECT * FROM FLOWS WHERE ENTITY_ID = " + entity_id + " OR SENDER_ENTITY_ID = " + entity_id + " ORDER BY ID DESC";
  db.executeNoBindReturnJson(query, flowsViewToFlows, next)
};


// get flows
const getNewFlows = function (entity_id = 21, next) {
  const query = "SELECT * FROM(SELECT * FROM FLOWS WHERE ENTITY_ID = " + entity_id + " OR SENDER_ENTITY_ID = " + entity_id + " AND STATUS_ID = 0 ORDER BY ID DESC) WHERE ROWNUM <= 300";
  db.executeNoBindReturnJson(query, flowsViewToFlows, next)
};

//get sent flows
const getLatestSentFlows = function (entity_id = 21, next) {
  const query = "SELECT * FROM FLOWS WHERE  SENDER_ENTITY_ID = " + entity_id;
  db.executeNoBindReturnJson(query, flowsViewToFlows, next)
};
//get a flow
const getFlow = function (flowId, next) {
  const query = "SELECT * FROM FLOWS WHERE ID = " + flowId;
  db.executeNoBindReturnJson(query, flowsViewToFlows, next)
};

// add suivi
const addSuivi = (flow, next) => {
  query = `
    BEGIN 
      ADD_SUIVI(
      :project_id,
      :user_id,
      :entity_id,
      :type_id,
      :content,
      :objet,    
      :sender,
      :flow_id
      );
    END;`;

  console.log(flow)
  let bindVarsPlus = {
    flow_id: {
      type: oracledb.NUMBER,
      dir: oracledb.BIND_OUT
    },
  };
  let bindVars = Object.assign(flow, bindVarsPlus);

  db.execute(query, bindVars, (result) => {
    let id = result.outBinds.flow_id;
    getFlow(id, (f) => {
      db.message.next({
        event: 'new suivi',
        content: {
          participants: [flow.entity_id.toString()],
          flow: f,
        }
      });
    })

    logger.log('info', `added suivi: suivi-${id} "${flow.title}" by user-${flow.user_id}`)
    next(id)
  })
}


//get sent flows
const getLatestTreatedFlows = function (entity_id = 21, next) {
  const query = "SELECT * FROM FLOWS WHERE STATUS_ID = 1 AND ENTITY_ID = " + entity_id;
  db.executeNoBindReturnJson(query, flowsViewToFlows, next)
};

//get project flows
const getProjectFlows = function (project_id = 21, next) {
  const query = "SELECT * FROM FLOWS WHERE PROJECT_ID = " + project_id;
  db.executeNoBindReturnJson(query, flowsViewToFlows, next)
};


const changeStatus = (flow, next) => {
  const flow_id = flow['flow_id'];
  const status_id = flow['status_id'];
  const query = `
  BEGIN 
    "CHANGE_FLOW_STATUS"(
    :flow_id,
    :status_id
    );
  END;`;
  db.execute(query, {
    flow_id: flow_id,
    status_id: status_id
  }, () => {
    db.message.next({
      event: 'flow status changed',
      content: {
        participants: [flow['entity_id'].toString()]
      }
    });
    next()
  })
};

module.exports = {
  getProjectFlows: getProjectFlows,
  getLatestFlows: getLatestFlows,
  getNewFlows: getNewFlows,
  getAllFlows: getAllFlows,
  getFlow: getFlow,
  getLatestSentFlows: getLatestSentFlows,
  getLatestTreatedFlows: getLatestTreatedFlows,
  changeStatus: changeStatus,
  addSuivi: addSuivi
};