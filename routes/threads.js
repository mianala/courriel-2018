let express = require('express')
let threadModel = require('../models/thread')
let router = express.Router()

let multer = require('multer')
const fileModel = require('../models/file')

let storage = multer.diskStorage({
  //todo:this is a property of the entity USER.FILESTORAGE
  destination: function (req, file, cb) {
    cb(null, 'public/thread/')
  },
  filename: function (req, file, cb) {
    cb(null, 'thread-' + Date.now() + '-' + file.originalname)
  }
})

let upload = multer({storage: storage})

//dispatch
router.post('/', upload.array("files", 5), function (req, res, next) {
  // console.log(req.body)
  threadModel.dispatch(req.body, (id) => {
    fileModel.saveThreadFiles(id, req.files, () => {
        res.send('got it ' + id)
      }
    )
    console.log(req.files)
  })
})

router.get('/', function (req, res, next) {
  threadModel.getThreads((threads) => {
    res.json(threads)
  })
})

//entity threads
router.get('/entity/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id']
  threadModel.getEntityThreads(entity_id, (threads) => {
    res.json(threads)
  })
})

//get project thread
router.get('/:project_id', function (req, res, next) {
  const project_id = req.params['project_id']
  threadModel.getProjectThreads(project_id, (threads) => {
    if (threads.length > 0) {
      res.json(threads)
    } else {
      res.json([])
    }
  })
})

module.exports = router;