let express = require('express')
let entityModel = require('../models/entity')
let router = express.Router()


router.get('/', function (req, res, next) {
  entityModel.getEntities(entities => {
    res.json(entities)
  })
});

router.get('/:entity_id', function (req, res, next) {
  const entity_id = req.params['entity_id']
  entityModel.getEntity(entity_id,entity => {
    res.json(entity[0])
  })
})

module.exports = router
