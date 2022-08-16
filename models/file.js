/**
 * Created by Loharano on 7/14/2017.
 */
const db = require('./db')
const env = require('../env/env')
const oracledb = require("oracledb")
const logger = require('../controllers/log').logger

class File {
  constructor(file) {
    this.id = file.ID;
    this.type = file.TYPE;
    this.filename = file.FILENAME;
    this.mimetype = file.MIMETYPE;
    this.originalname = file.ORIGINALNAME;
    this.date = file.DATE;
    this.size = file.SIZE;
    this.src = file.SRC;
    this.type_id = file.TYPE_ID;
  }
}

let filesViewTofiles = function (arrayOfFiles) {
  let files = [];
  arrayOfFiles.forEach(function (row) {
    let file = new File(row);

    file.src = file.src.replace('public', env.hostIp)
    files.push(file);
  });
  return files;
};

let saveFlowFiles = (type_id, files) => {
  files.forEach((file) => {
    saveFlowFile(type_id, file)
  })
}
let saveProjectFiles = (type_id, files) => {
  files.forEach((file) => {
    saveProjectFile(type_id, file)
  })
}
let saveProjectFilesN = (type_id, files, next) => {
  files.forEach((file) => {
    saveProjectFile(type_id, file)
  })
  next()
}
let saveThreadFiles = (type_id, files, next) => {
  files.forEach((file) => {
    saveThreadFile(type_id, file)
  })
  next()
}

let save = (query, type_id, f) => {

  f.destination = f.destination.replace('public/', '')

  let bindVars = {
    id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT},
    filename: f.filename,
    originalname: f.originalname,
    in_size: f.size,
    src: f.path,
    type_id: type_id,
    mimetype: f.mimetype,
  }

  db.execute(query, bindVars, function (result) {
    console.log('file ' + result.outBinds.id + ' added')
  })
}


let removeFile = (file_id, next) => {
  let query = `BEGIN REMOVE_FILE(${file_id}); END;`
  db.executeNoBind(query, ()=>{
    logger.log('info', `removed file id: ${file_id}`)
    next(file_id)
  })
}

let saveFlowFile = (type_id, f) => {
  const query = `
    BEGIN
      ADD_FLOW_FILE (
        :id,
        :filename,
        :originalname,
        :in_size,
        :src,
        :type_id,
        :mimetype
        );
  END;`

  save(query, type_id, f)

}

let saveProjectFile = (type_id, f) => {
  const query = `
    BEGIN
      ADD_PROJECT_FILE (
        :id,
        :filename,
        :originalname,
        :in_size,
        :src,
        :type_id,
        :mimetype
        );
  END;`

  save(query, type_id, f)
}

let saveThreadFile = (type_id, f) => {
  const query = `
    BEGIN
      ADD_THREAD_FILE (
        :id,
        :filename,
        :originalname,
        :in_size,
        :src,
        :type_id,
        :mimetype
        );
  END;`

  save(query, type_id, f)
}


//get flow files
let getFlowFiles = function (type_id, next) {
  let query = "SELECT * FROM FLOW_FILES WHERE TYPE_ID = " + type_id;
  db.executeNoBind(query, function (result) {
    db_files = result.rows;
    let files = filesViewTofiles(db_files);
    next(files);
  })
}

let getProjectFiles = function (id, next) {
  let query = "SELECT * FROM PROJECT_FILES WHERE TYPE_ID = " + id;

  db.executeNoBind(query, function (result) {
    db_files = result.rows;
    let files = filesViewTofiles(db_files);
    next(files);
  })
}


let getTemplateFiles = function (next) {
  let query = "SELECT * FROM TEMPLATE_FILES"

  db.executeNoBind(query, function (result) {
    db_files = result.rows;
    let files = filesViewTofiles(db_files);
    next(files);
  })
}

let getThreadFiles = function (threadId, next) {
  let query = "SELECT * FROM THREAD_FILES WHERE TYPE_ID = " + threadId;
  db.executeNoBind(query, function (result) {
    db_files = result.rows;
    let files = filesViewTofiles(db_files);
    next(files);
  })
}


module.exports = {
  getFlowFiles: getFlowFiles,
  removeFile: removeFile,
  getTemplateFiles: getTemplateFiles,
  saveFlowFiles: saveFlowFiles,
  getProjectFiles: getProjectFiles,
  saveProjectFiles: saveProjectFiles,
  saveProjectFilesN: saveProjectFilesN,
  saveThreadFiles: saveThreadFiles,
  getThreadFiles: getThreadFiles,
}
