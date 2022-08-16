const express = require('express')
const router = express.Router()
const Report = new require('../models/report')
const upload = new require('../utils/upload').upload

router.get('/:id', (req, res, next) => {
  Report.get(req.params.get('id'), report => {
    res.json(report)
  })
})

router.delete('/:id', (req, res, next) => {
  Report.delete(req.params.get('id'), report => {
    res.json(report)
  })
})

router.get('/', (req, res, next) => {
  Report.all(req.params.get('id'), report => {
    res.json(report)
  })
})

router.post('/',upload.array("files",5), (req, res, next) => {

  const report = JSON.parse(req.body.data)
  console.log(report)

  res.send("posted")
  /*
  Report.save(req.body, report => {
    req.send("posted")
  })*/
})

module.exports = router
