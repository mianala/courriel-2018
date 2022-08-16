const express = require('express');
const router = express.Router();
const modelBe = require('../models/be')
const moment = require('moment')
//post in BE
router.get('/be/:id', function (req, res, next) {
  const id = req.params['id'];
  modelBe.getBe(id, (bes) => {

    if (bes.length > 0) {

      be = bes[0]
      be.ds = be.titles.split(',');
      be.cs = be.counts.split(',');
      moment.locale('fr')
      be.date = moment(be.date).format('Do MMMM YYYY')
      res.render('be', be);
    }else{
      res.send('Ohhh.. perdu ?')
    }
  })
});



module.exports = router;
