const db = require('./db');
const oracledb = require("oracledb");
const fileModel = require('./file');
const entityModel = require('./entity');
const threadModel = require('./thread');
const logger = require('../controllers/log').logger
let query = ''

class ProjectLine {

  constructor(project) {
    // this.id = project.ID;
    this.sender = project.SENDER;
    this.numero = project.NUMERO;
    this.ref = project.REF ? unescape(project.REF) : project.REF;
    // this.courriel_date = project.COURRIEL_DATE;
    // this.date = project.DATE;
    this.received_date = project.RECEIVED_DATE;
    this.title = unescape(project.TITLE);
    this.description = project.DESCRIPTION;
    this.content = project.CONTENT;
    // this.entity_id = project.ENTITY_ID;
    // this.user_id = project.USER_ID;
    // this.type_id = project.TYPE_ID;
    // this.letter_id = project.LETTER_ID;
    this.status_id = project.STATUS_ID;
    // this.n_project = project.N_PROJECT;
    this.date = project.DATE;
    this.receiver = project.LABEL ? project.LABEL : project.RECEIVER;
    this.observation = project.CONTENT;

  }
}


let projectViewToLine = (array, next) => {
  let projects = [];
  let project = {}
  if (array.length === 0) {
    next([])
  }

  array.forEach(function (row) {
    project = new ProjectLine(row)
    projects.push(project);

    if (projects.length === array.length) {
      next(projects)
    }
  })
};

const getAllProjectLines = (entityId, next) => {
  // query = "SELECT * FROM PROJECTS WHERE ENTITY_ID = " + entityId + " AND COURRIEL_DATE > CURRENT_DATE - 50";
  query = "SELECT * FROM PROJECT_LINE WHERE ENTITY_ID = " + entityId;
  db.executeNoBind(query, function (result) {
    db_projects = result.rows;
    projectViewToLine(db_projects, (projects) => {
      next(projects)
    })
  })
};


module.exports = {
  getAllProjectLines: getAllProjectLines,
};