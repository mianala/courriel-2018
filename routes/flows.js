/**
 * Created by Loharano on 7/14/2017.
 */

//api/flows

const express = require('express');
const flowModel = require('../models/flow');
let router = express.Router();
const multer = require('multer');
const fileModel = require('../models/file');
let beModel = require('../models/be');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/flows/')
  },
  filename: function (req, file, cb) {
    cb(null, 'flow-' + Date.now() + '-' + file.originalname)
  }
});

const upload = multer({storage: storage});

//get entity flows
router.get('/entity/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id'];
  flowModel.getFlows(entity_id, function (flows) {
    res.json(flows)
  })
});

//get latest entity flows
router.get('/latest/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id'];
  flowModel.getLatestFlows(entity_id, function (flows) {
    res.json(flows)
  })
});

//get all entity flows
router.get('/all/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id'];
  flowModel.getAllFlows(entity_id, function (flows) {
    res.json(flows)
  })
});


//get entity sent flows
router.get('/entity/sent/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id'];
  flowModel.getSentFlows(entity_id, function (flows) {
    res.json(flows)
  })
});

//get entity treated flows
router.get('/entity/treated/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id'];
  flowModel.getTreatedFlows(entity_id, function (flows) {
    res.json(flows)
  })
});

//get project flows
router.get('/project/:project_id', function (req, res, next) {
  const project_id = req.params['project_id'];
  if (project_id < 1) {
    res.send('joke?');
    return
  }
  flowModel.getProjectFlows(project_id, function (flows) {
    res.json(flows)
  })
});

//get flow
router.get('/:entity_id/:flow_id', function (req, res, next) {
  const flow_id = req.params["flow_id"];
  const entity_id = req.params["entity_id"];
  flowModel.getFlow(flow_id, function (flow) {
    res.json(flow[0])
  })
});

// change status
router.post('/update_flow_status', function (req, res, next) {
  flowModel.changeStatus(req.body['flow_id'],req.body['status_id'], () => {
    console.log('Flow treated')
  })
});

// change status
router.post('/suivi', upload.array("files", 10), function (req, res, next) {
  flowModel.addSuivi(req.body, (id) => {
    res.json(id)
  })
});



module.exports = router;

