/**
 * Created by Loharano on 7/12/2017.
 */
const express = require('express')
let router = express.Router()
let emailModel = require('../models/email')
const multer = require('multer')
const fileModel= require('../models/file')

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/flows/')
  },
  filename: function (req, file, cb) {
    cb(null, 'flow-' + Date.now() + '-' + file.originalname)
  }
})

let upload = multer({storage: storage})


//all mails
router.get('/:id/:user_id', function (req, res, next) {
  let flow_id = req.params["id"]
  let user_id = req.params["user_id"]
  //todo user has seen the flow

  emailModel.getMails(flow_id, function (emails) {
    res.json(emails)
  })
})

//answer flow
router.post('/flow', upload.array("files", 5), function (req, res, next) {
  console.log('answering flow')
  console.log(req.body)
  emailModel.answerFlow(req.body, result => {
    console.log('flow answered ' + result)
    fileModel.saveFiles(result, req.files)
    //todo websocket next

    res.send('message sent')
  })
})

//transfer message
router.post('transfer', function (req, res, next) {
  const email_id = req.params['email_id']
  const receiver_id = req.params['receiver_id']
  console.log('transfering email ' + email_id + ' to ' + receiver_id)
  emailModel.transfer(email_id, receiver_id, (result) => {
    console.log('mail transfered')
    //todo websocket next

    res.send('sent')
  })
})

router.delete('/:id', function (req, res, next) {
  const email_id = req.params["id"];
  console.log('Deleting email ' + email_id)
  emailModel.deleteEmail(email_id, (result) => {
    console.log('Email deleted  ' + result)
    //todo websocket next

    res.send('deleted')
  })
});

module.exports = router;

