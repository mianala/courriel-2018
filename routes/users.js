const express = require('express')
const userModel = require('../models/user')
const multer = require('multer')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const router = express.Router()
const logger = require('../controllers/log').logger

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    let dir = 'public/users/avatars/'

    callback(null, dir)
  },
  filename: function (req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase()
    callback(null, req.body.user_id + ext)
  }
})

let upload = multer({
  storage: storage
})


//logging in
router.post('/user', function (req, res, next) {

  let user = req.body
  if (req.body.id !== undefined) {
    userModel.logUser(user, function (u) {
        req.session.user = u
        console.log('session set');
        
        logger.log('info', `user logged in: ${u.fullname} ${u.entity.label} ${u.id}`)
        res.json(req.session.user)
      }, function (error) {
        logger.log('error', `user wrong credentials: ${user.id} ${user.password} `)
        res.json({error: error})
      }
    )
  } else if (user.type === 'logout') {
    console.log('loggout')
    if (req.session.user) {

      logger.log('info', `logging out: ${req.session.user.fullname} ${req.session.user.entity.label} ${req.session.user.id} `)
      req.session.destroy()
      res.json('logged out')
    } else {
      res.json('already logged out')

    }
  } else if (req.session.user === undefined) {
    console.log(req.session.user)
    res.json('0')
  } else {
    console.log("already logged " + req.sessionID)
    res.json(req.session.user)
  }
})

//get all users
router.get('/', function (req, res, next) {
  userModel.getUsers(users => {
    res.json(users)
  })
})
//get all users
router.get('/usernames', function (req, res, next) {
  userModel.getUsernames(users => {
    res.json(users)
  })
})

// update user credentials
router.post('/update', function (req, res, next) {
  userModel.update(req.body, () => {
    res.send('user updated')
  })
})

//get all users
router.get('/logout', function (req, res, next) {
  logger.log('info', `logging out: user-${req.session.user.id} ${req.session.user.fullname} entity:${req.session.user.entity}`)
  req.session.reset()
  res.send("session reset")
})

//get entity users
router.get('/entity/:entity', function (req, res, next) {
  let label = req.params['entity']
  userModel.getUsersByLabel(label, function (users) {
    res.json(users)
  })
})

//user add
router.post('/avatar', upload.single('avatar'), function (req, res, next) {

  let user = req.body // user_id + avatar
  user.avatar = req.file ? user.user_id + getExt(req.file) : ''
  userModel.updateAvatar(user, () => {
    res.send('avatar updated')
  })
})

// get user
router.get('/:id', function (req, res, next) {
  let user_id = req.params["id"]
  userModel.getUser(user_id, function (user) {
    res.json(user)
  })
})

const getExt = (file) => {
  return path.extname(file.originalname).toLowerCase()
}

module.exports = router
