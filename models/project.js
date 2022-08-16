const db = require('./db');
const oracledb = require("oracledb");
const fileModel = require('./file');
const entityModel = require('./entity');
const threadModel = require('./thread');
const logger = require('../controllers/log').logger
let query = ''
class Project {

  constructor(project) {
    this.id = project.ID;
    this.ref = project.REF ? unescape(project.REF) : project.REF;
    this.numero = project.NUMERO;
    this.n_arrive = project.N_ARRIVE;
    this.courriel_date = project.COURRIEL_DATE;
    this.date = project.DATE;
    this.received_date = project.RECEIVED_DATE;
    this.title = unescape(project.TITLE);
    this.content = project.CONTENT;
    this.description = project.DESCRIPTION;
    this.entity_id = project.ENTITY_ID;
    this.sender = project.SENDER;
    this.user_id = project.USER_ID;
    this.type_id = project.TYPE_ID;
    this.letter_id = project.LETTER_ID;
    this.status_id = project.STATUS_ID;
    this.n_project = project.N_PROJECT;
    this.entity_label = project.ENTITY_LABEL;
  }
}

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

let projectsViewToProjects = (array, next) => {
  let projects = [];
  let project

  if (array.length === 0) {
    next([])
  }
  array.forEach(function (row) {
    project = new Project(row);

    projects.push(project);

    if (projects.length === array.length) {
      next(projects)
    }
  })
};

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

let projectsViewToProjectsWithFile = (array, next) => {
  let projects = [];
  let project
  if (array.length === 0) {
    next([])
  }
  array.forEach(function (row) {
    project = new Project(row);
    fileModel.getProjectFiles(row.ID, function (files) {
      project.files = files;

      projects.push(project);

      if (projects.length === array.length) {
        next(projects)
      }
    })
  })
};

const getAllProjects = (entityId, next) => {
  // query = "SELECT * FROM PROJECTS WHERE ENTITY_ID = " + entityId + " AND COURRIEL_DATE > CURRENT_DATE - 50";
  query = "SELECT * FROM PROJECTS WHERE ENTITY_ID = " + entityId;
  db.executeNoBind(query, function (result) {
    db_projects = result.rows;
    projectsViewToProjects(db_projects, (projects) => {
      next(projects)
    })
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

const getLatestProjects = (entityId, next) => {
  // query = "SELECT * FROM PROJECTS WHERE ENTITY_ID = " + entityId + " AND COURRIEL_DATE > CURRENT_DATE - 50";
  query = "SELECT * FROM (SELECT * FROM PROJECTS WHERE ENTITY_ID = " + entityId + " ORDER BY ID DESC) WHERE ROWNUM <= 300";
  db.executeNoBind(query, function (result) {
    db_projects = result.rows;
    projectsViewToProjects(db_projects, (projects) => {
      next(projects)
    })
  })
};


const getProject = (project_id, next) => {
  query = "SELECT * FROM PROJECTS WHERE ID =" + project_id;
  db.executeNoBind(query, function (result) {
    db_projects = result.rows;
    projectsViewToProjects(db_projects, (projects) => {
      next(projects[0])
    })
  })
};


const treat = (project, next) => {
  const id = project['id'];
  const entity_id = project['entity_id'].toString();
  const participants = [entity_id];

  query = `
  BEGIN 
    "TREAT_PROJECT"(
    :project_id
    );
  END;`;
  db.execute(query, {
    project_id: id
  }, () => {
    db.message.next({
      event: 'project treated',
      content: {
        participants: participants
      }
    });
    next()
  })
};

const printProjects = (filters) => {

  query = `
  SELECT * FROM PROJECT_LINE 
    
    );
  END;`;
}

let saveProject = (project, next) => {
  query = `
  BEGIN 
    ADD_PROJECT(
    :ref,
    :numero,
    :entity_id,
    :sender,    
    :title,
    :content,
    :description,
    :courriel_date,
    :received_date,
    :letter_id,
    :type_id,
    :user_id,
    :project_id
    );                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  END;`;

  //bindvars will use the params from the save service in the front apart from those that requires oracle or changes
  let bindVarsPlus = {
    project_id: {
      type: oracledb.NUMBER,
      dir: oracledb.BIND_OUT
    },
  };


  let bindVars = Object.assign(project, bindVarsPlus);

  db.execute(query, bindVars, (result) => {
    let id = result.outBinds.project_id;
    getProject(id, (project) => {
      db.message.next({
        event: 'new project',
        content: {
          participants: [project.entity_id.toString()],
          project: project,
        }
      });
    })

    logger.log('info', `saved: project-${id} "${project.title}" by user-${project.user_id}`)
    next(id)
  })

};


let editProject = (project, next) => {
  query = `
    UPDATE TABLE_PROJECT
      SET
        NUMERO = '${project.numero}',
        SENDER = '${project.sender}',
        RECEIVED_DATE = TO_DATE('${project.received_date}','yyyy/mm/dd'),
        COURRIEL_DATE = TO_DATE('${project.courriel_date}','yyyy/mm/dd'),
        TYPE_ID = ${project.type_id},
        LETTER_ID = ${project.letter_id},
        REF = '${escape(project.ref)}',
        TITLE = '${escape(project.title)}'
    WHERE ID = ${project.id}`;
  db.executeNoBind(query, () => {
    db.message.next({
      event: 'project edited',
      content: {
        participants: [project.entity_id.toString()]
      }
    });
    logger.log('info', `edited: project-${project.id} by user-${project.user_id}`)
    next(project.id)
  })
};


let updateStatus = (project_id, entity_id, status_id, next) => {
  query = `
    UPDATE TABLE_PROJECT
      SET
        STATUS_ID = ${status_id}
    WHERE ID = ${project_id}`;
  db.executeNoBind(query, () => {
    db.message.next({
      event: 'project status updated',
      content: {
        participants: [entity_id.toString()]
      }
    });
    logger.log('info', `status update: project-${project_id} by entity-${entity_id}`)
    next(project_id)
  })
};

//  addproject and dispatch
let composeProject = (project, next) => {

  // COMPOSE is an ORACLE keyword

  query = `
  BEGIN LCOMPOSE(
      :ref,
      :title,
      :content,
      :sender_entity_id,
      :user_id,
      :project_id
    );
  END;`;

  //bindvars will use the params from the save service in the front apart from those that requires oracle or changes
  const bindVarsPlus = {
    project_id: {
      type: oracledb.NUMBER,
      dir: oracledb.BIND_OUT
    }
  };

  let p = {
    ref: project.ref,
    title: project.title,
    content: project.content,
    sender_entity_id: project.sender_entity_id,
    title: project.title,
    user_id: project.user_id,
  }

  const bindVars = Object.assign(p, bindVarsPlus);
  db.execute(query, bindVars, (result) => {

    const project_id = result.outBinds.project_id
    let thread = {
      sender_entity_id: project.sender_entity_id,
      receivers: project.receivers,
      receiver: project.receiver,
      content: project.content,
      user_id: project.user_id,
      project_id: project_id,
    }

    threadModel.dispatch(thread, next)
  })
};

let deleteProject = (project_id, next) => {
  query = `  
    UPDATE TABLE_PROJECT
    SET
      HIDDEN = 1
    WHERE ID = ${project_id}`;
  db.executeNoBind(query, () => {
    logger.log('info', `removed project id: ${project_id}`)
    next()
  })
}

module.exports = {
  getAllProjects: getAllProjects,
  getAllProjectLines: getAllProjectLines,
  getLatestProjects: getLatestProjects,
  getProject: getProject,
  composeProject: composeProject,
  editProject: editProject,
  saveProject: saveProject,
  deleteProject: deleteProject,
  treat: treat,
  updateStatus: updateStatus
};