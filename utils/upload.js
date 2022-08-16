const multer = require('multer')

const flowStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/flows/')
  },
  filename: function (req, file, cb) {
    cb(null, 'flow-' + Date.now() + '-' + file.originalname)
  }
})

const reportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/reports/')
  },
  filename: function (req, file, cb) {
    cb(null, 'flow-' + Date.now() + '-' + file.originalname)
  }
})

const upload = multer({storage: reportStorage})


module.exports = {
  upload: upload
}