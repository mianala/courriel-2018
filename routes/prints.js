let express = require('express');
let projectModel = require('../models/project');
let beModel = require('../models/be');
let router = express.Router();
let xls = require('xlsx')
const env = require('../env/env')
const pathModule = require("path");

let multer = require('multer');
const fileModel = require('../models/file');

let storage = multer.diskStorage({
  //todo:this is a property of the entity USER.FILESTORAGE
  destination: (req, file, cb) => {
    cb(null, 'public/project/')
  },
  filename: (req, file, cb) => {
    cb(null, 'project-' + Date.now() + '-' + file.originalname)
  }
});


let upload = multer({
  storage: storage
});


// export-all
router.post('/export-all', (req, rproes, next) => {
let entity_id = JSON.parse(req.body.entity_id);
  console.log(entity_id)
  projectModel.getAllProjectLines(entity_id, (projects) => {
    var wb = xls.utils.book_new();
    var ws = xls.utils.json_to_sheet(projects, {
      header: ['A', 'B', 'C'],
      skipHeader: true
    })

    xls.utils.book_append_sheet(wb, ws, 'MEF COURRIELS')

    var file = 'COURRIELS-' + new Date().getTime() + '.xlsx'
    var path = pathModule.join(__dirname, '../public/exports/') + file
    xls.writeFile(wb, path)
    // console.log(pathModule.join(__dirname, '../public/exports/') + file)
    res.json(file)
  })
});


module.exports = router;