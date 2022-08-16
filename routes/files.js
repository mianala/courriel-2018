let express = require('express')
let fileModel = require('../models/file')
let router = express.Router()

// gettinq all templates : will soon be removed
router.get('/templates', function (req, res, next) {
  fileModel.getTemplateFiles(templates => {
    res.json(templates)
  })
})

router.delete('/:id', (req, res, next) => {
  console.log(req.params['id'])
  fileModel.removeFile(req.params['id'], (id) => {
    res.sendStatus(200)
  })
})

router.get('/project/:id', (req, res, next) => {
  project_id = req.params['id']
  fileModel.getProjectFiles(project_id, (files) => {
    res.json(files)
  })
})

router.get('/flow/:id', (req, res, next) => {
  project_id = req.params['id']
  fileModel.getFlowFiles(project_id, (files) => {
    res.json(files)
  })
})

router.get('/thread/:id', (req, res, next) => {
  thread_id = req.params['id']
  fileModel.getThreadFiles(thread_id, (files) => {
    res.json(files)
  })
})


router.get('/flow/:id', (req, res, next) => {
  flow_id = req.params['id']
  fileModel.getFlowFiles(flow_id, (files) => {
    res.json(files)
  })
})

module.exports = router