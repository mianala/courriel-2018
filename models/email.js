/**
 * Created by Loharano on 7/14/2017.
 */
const db = require('./db');
const file = require('./file');
const oracledb = require("oracledb")
const Rx = require('rxjs/Rx')
let email = new Rx.BehaviorSubject({})

class Email {
  constructor(email, files) {
    this.id = email.ID;
    this.title = email.EMAIL_TITLE;
    this.content = email.CONTENT;
    this.sentBy = email.SENT_BY;
    this.date_created = email.DATE_CREATED;
    this.seen = email.SEEN;
    this.writer_id = email.WRITER_ID;
    this.files = files;
  }
}

let emailsViewToEmails = (array, next) => {
  let emails = [];
  array.forEach(function (row) {

    file.getFiles(row.ID, function (files) {
        let email = new Email(row, files);
        emails.push(email);
        if (emails.length == array.length) {
          next(emails)
        }
      }
    )
  });
};


let getMails = (flowId, next) => {
  let query = "SELECT * FROM EMAILS WHERE FLOW_ID = " + flowId;
  db.executeNoBind(query, function (result) {
    db_emails = result.rows;
    emailsViewToEmails(db_emails, function (result) {
      next(result);
    });
  })
}

// answering flow
let answerFlow = (mail, next) => {
  let query = `
  BEGIN 
  ADD_EMAIL(
  :mail_id,
  :in_title,
  :in_content,
  :in_writer_id,
  :in_flow_id,
  :in_sent_by);
  END;`

  //todo in_sent_by => seen

  let bindVars = {
    mail_id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT},
    in_title: mail.title,
    in_content: mail.content,
    in_writer_id: mail.writer_id,
    in_flow_id: mail.flow_id,
    in_sent_by: mail.sent_by,
  }

  db.execute(query, bindVars, function (result) {
    let id = result.outBinds.mail_id
    email.next({id:mail.flow_id})
    next(id)
  })
}

//delete email
let deleteEmail = (email_id, next) => {
  let query = `
  BEGIN 
  DELETE_EMAIL(
  :email_id);
  END;`

  let bindVars = {
    email_id: email_id
  }

  db.execute(query, bindVars, function () {
    next()
  })
}


let transferEmail = (email_id, receiver_id, next) => {
  let query = `
  BEGIN 
  TRANSFER_EMAIL(
  :email_id,
  :receiver_id);
  END;`

  let bindVars = {
    email_id: email_id,
    receiver_id: receiver_id,
  }

  db.execute(query, bindVars, function () {
    next()
  })
}

module.exports = {
  email: email,
  getMails: getMails,
  answerFlow: answerFlow,
  deleteEmail: deleteEmail,
}