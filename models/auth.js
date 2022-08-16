let userModel = require('../models/user');

module.exports = {
  auth(req,res,next){
    if (req.session.user == undefined) {
      userModel.getUser(2, function (user) {
        console.log("logged")
        req.session.user = user
        res.json(req.session.user)
      })
    } else {
      console.log("logged")
      res.json(req.session.user)
    }
  }
}