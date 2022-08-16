
let express = require('express');
let messageModel = require('../models/message');
let router = express.Router();
const multer = require('multer');
const fileModel = require('../models/file');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/messages/')
  },
  filename: function (req, file, cb) {
    cb(null, 'message-' + Date.now() + '-' + file.originalname)
  }
});
let upload = multer({storage: storage});

//start message
router.post('/', upload.array("files", 5), function (req, res, next) {
  messageModel.saveMessage(req.body, result => {
    console.log('message created ' + result);
    //todo websocket message starter

    fileModel.saveMessageFiles(result, req.files)
  })
});

//get entity messages
router.get('/entity/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id'];
  messageModel.getMessages(entity_id, function (flows) {
    res.json(flows)
  })
});

module.exports = router;
