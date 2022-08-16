/**
 * Created by Loharano on 7/13/2017.
 */
const db = require("./db")
const env = require("../env/env")

// const photoDirectory = 'http://192.168.90.90:3000/users/avatars/';
const photoDirectory = env.hostIp + "/users/avatars/"
const oracledb = require("oracledb")
const entityModel = require("./entity")
const logger = require("../controllers/log").logger

class User {
  constructor(user) {
    this.im = user.IM
    this.entity = user.LABEL
    this.entity_id = user.ENTITY_ID
    this.entity_title = user.ENTITY_TITLE
    this.entity_label = user.LABEL
    this.entity_header = user.HEADER
    this.entity_entity = user.ENTITY_ENTITY
    this.name = user.NAME
    this.username = user.USERNAME
    this.fullname = user.FULL_NAME
    this.function_title = user.TITLE
    this.email = user.EMAIL
    if (user.AVATAR === null || user.AVATAR === "") {
      this.photo = "assets/images/user.png"
    } else {
      this.photo = photoDirectory + user.AVATAR
    }
    this.id = user.ID
  }
}

let usersViewToUsers = function (array, next) {
  let users = []
  array.forEach(function (row) {
    let user = new User(row)
    users.push(user)
    if (users.length === array.length) {
      //next
      next(users)
    }
  })
}

let logUser = function (data, success, error) {
  const id = data.id
  const pass = data.password
  let query =
    "SELECT * FROM USERS WHERE ((IM = '" +
    id +
    "' OR USERNAME = '" +
    id +
    "') AND HASHED = '" +
    pass +
    "')"
  console.log("logging user " + id)
  db.executeNoBind(query, function (result) {
    log(result.rows)
    if (result.rows.length == 0) {
      error("Utilisateur non enregistré")
    } else {
      getUser(result.rows[0].ID, (user) => {
        success(user)
      })
    }
  })
}

let saveUser = function (user, next) {
  let query = `
  BEGIN 
  ADD_USER(
  :user_id,
  :in_entity_id,
  :in_function_id,
  :in_im,
  :in_username,
  :in_name,
  :in_fullname,
  :in_title,
  :in_email,
  :in_avatar,
  :in_hashed);
  END;`

  let bindVars = {
    user_id: {
      type: oracledb.NUMBER,
      dir: oracledb.BIND_OUT,
    },
    in_entity_id: user.entityId,
    in_function_id: user.functionId,
    in_im: user.im && user.im !== "undefined" ? user.im : null,
    in_username: user.username,
    in_name: user.name,
    in_fullname: user.fullname,
    in_title: user.title,
    in_email: user.email,
    in_avatar: user.avatar ? user.avatar : null,
    in_hashed: user.password,
  }

  console.log("new user")
  console.log(bindVars)
  db.execute(query, bindVars, function (result) {
    let id = result.outBinds.user_id
    next(id)
  })
}

let update = (user, next) => {
  let query = `
  UPDATE TABLE_USER SET USERNAME = '${user.username}', HASHED = '${user.password}' WHERE ID = ${user.user_id}
    `
  db.executeNoBind(query, () => {
    logger.log("info", `updated credentials: user-${user.user_id}`)
    next()
  })
}

let updateAvatar = (user, next) => {
  let query = `
    UPDATE TABLE_USER SET AVATAR = '${user.avatar}' WHERE ID = ${user.user_id}
  `
  db.executeNoBind(query, () => {
    logger.log("info", `updated avatar: user-${user.user_id}`)
    next()
  })
}

let getUsers = function (next) {
  let query = "SELECT * FROM USERS"
  db.executeNoBind(query, function (result) {
    db_users = result.rows
    usersViewToUsers(db_users, (user) => {
      next(user)
    })
  })
}

let getUsernames = function (next) {
  let query = "SELECT * FROM USERNAMES"
  let usernames = []
  db.executeNoBind(query, function (result) {
    db_users = result.rows
    db_users.forEach(function (row) {
      let username = row.USERNAME
      usernames.push(username)

      if (usernames.length === db_users.length) {
        //next
        next(usernames)
      }
    })
  })
}

let getUsersByLabel = function (label, next) {
  let query = "SELECT * FROM USERS WHERE LABEL = '" + label + "'"
  db.executeNoBind(query, function (result) {
    db_users = result.rows
    usersViewToUsers(db_users, (user) => {
      next(user)
    })
  })
}

let getEntityUsers = function (entity_id, next) {
  let query = "SELECT * FROM USERS WHERE ENTITY_ID = '" + entity_id + "'"
  db.executeNoBind(query, function (result) {
    db_users = result.rows
    usersViewToUsers(db_users, (user) => {
      next(user)
    })
  })
}

let getUser = function (user_id, next) {
  let query = "SELECT * FROM USERS WHERE ID = " + user_id
  console.log(query)
  db.executeNoBind(query, function (result) {
    db_users = result.rows
    usersViewToUsers(db_users, (user) => {
      next(user[0])
    })
  })
}

module.exports = {
  saveUser: saveUser,
  getUser: getUser,
  getEntityUsers: getEntityUsers,
  getUsers: getUsers,
  getUsernames: getUsernames,
  logUser: logUser,
  update: update,
  updateAvatar: updateAvatar,
  getUsersByLabel: getUsersByLabel,
}
