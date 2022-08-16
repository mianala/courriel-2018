let db = require('./db');
const oracledb = require("oracledb");
let file = require('./file');
let entityModel = require('./entity');
const logger = require('../controllers/log').logger

class Thread {
  constructor(thread) {
    this.id = thread.THREAD_ID;
    this.sender_entity_id = thread.SENDER_ENTITY_ID;
    this.project_id = thread.PROJECT_ID;
    this.status = thread.STATUS_ID;
    this.date = thread.DATE;
    this.project_title = thread.PROJECT_TITLE;
    this.n_depart = thread.N_DEPART;
    this.observations = thread.OBSERVATIONS;
    this.entity_id = thread.ENTITY_ID;
    this.receivers = thread.RECEIVERS
  }
}

let dispatch = (thread, next) => {
  let query = `
  BEGIN
    DISPATCH(
      :thread_id,
      :sender_entity_id,
      :project_id,
      :receivers,
      :receiver,
      :content,
      :user_id
    );
  END;
  `;

  let bindVarsPlus = {
    thread_id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT},
  };

  let bindVars = Object.assign(thread, bindVarsPlus);
  console.log(bindVars)
  const content = {participants: [thread.sender_entity_id.toString()].concat(thread.receivers.split(','))};
  console.log('dispatching');
  db.execute(query, bindVars, (result) => {
    let id = result.outBinds.thread_id;
    logger.log('info', `dispatched: project-${thread.project_id} to ${thread.receivers} by entity-${thread.sender_entity_id} user-${thread.user_id}`)
    db.message.next({event: 'dispatch', content: content});
    next(id)
  })

};

let threadsViewToThreads = (array, next) => {
  let threads = [];
  array.forEach(function (row) {
    //attach file
    file.getThreadFiles(row.THREAD_ID, function (files) {
        let thread = new Thread(row);
        file.getProjectFiles(thread.project_id, project_files => {

          thread.files = files;
          thread.project_files = project_files;
          //attach project

          threads.push(thread);
          if (threads.length === array.length) {
            //next
            next(threads)
          }
        })
      }
    )
  })
};

let getThreads = (next) => {
  let query = "SELECT * FROM THREADS";
  db.executeNoBind(query, function (result) {
    db_Threads = result.rows;
    threadsViewToThreads(db_Threads, (thread) => {
      next(thread)
    })
  })
};
let getEntityThreads = (entity_id, next) => {
  let query = "SELECT * FROM THREADS WHERE ENTITY_ID = " + entity_id;
  db.executeNoBind(query, function (result) {
    db_Threads = result.rows;

    if (result.rows.length === 0) {
      next([])
    } else {
      threadsViewToThreads(db_Threads, (thread) => {
        next(thread)
      })
    }
  })
};

let getThread = (id, next) => {
  let query = "SELECT * FROM THREADS WHERE THREAD_ID = " + id;
  db.executeNoBind(query, function (result) {
    db_Threads = result.rows;
    threadsViewToThreads(db_Threads, (threads) => {
      next(threads[0])
    })
  })
};


let getThreadFlows = function (thread = 21, next) {
  let query = "SELECT * FROM FLOWS WHERE THREAD_ID = " + thread;
  db.executeNoBind(query, function (result) {
    let db_flow = result.rows;

    if (result.rows.length === 0) {
      next([])
    } else {
      flowsViewToFlows(db_flow, (flows) => {
        next(flows)
      })
    }
  })
};


let getProjectThreads = (project_id, next) => {
  console.log('getting project threads');
  let query = "SELECT * FROM THREADS WHERE PROJECT_ID = " + project_id;
  db.executeNoBind(query, function (result) {
    db_Threads = result.rows;
    if (result.rows.length === 0) {
      next([])
    } else {
      console.log('converting threads');
      threadsViewToThreads(db_Threads, (Threads) => {
        next(Threads)
      })
    }
  })
};


let flowsViewToFlows = function (array, next) {
  let flows = [];
  if (array) {
    array.forEach(function (row) {
      let flow = new Flow(row);

      entityModel.getEntity(flow.entity_id, entity => {
        flow.entity = entity[0];

        flows.push(flow);
        if (flows.length === array.length) {
          //next

          next(flows)
        }
      })
    })
  }
};


class Flow {

  constructor(flow) {
    this.id = flow.ID;
    this.thread_id = flow.THREAD_ID;
    this.project_id = flow.PROJECT_ID;
    this.content = flow.CONTENT;
    this.entity_id = flow.ENTITY_ID;
    this.n_arrive = flow.N_ARRIVE
  }
}

module.exports = {
  getEntityThreads: getEntityThreads,
  getThreads: getThreads,
  getThread: getThread,
  getProjectThreads: getProjectThreads,
  dispatch: dispatch
};
