/**
 * Created by Loharano on 7/14/2017.
 */
let db = require('./db');

class Entity {
  constructor(entity) {
    this.id = entity.ID;
    this.label = entity.LABEL;
    this.title = entity.TITLE;
    this.entity = entity.ENTITY;
    this.n_arrive = entity.N_ARRIVE;
    this.n_depart = entity.N_DEPART;
    this.n_project = entity.N_PROJECT;
    this.header = entity.HEADER;
    this.head = entity.HEAD;
    this.be_header = entity.BE_HEADER
  }
}

let dbToEntities = function (array, next) {
  let entities = [];
  if (array) {
    array.forEach(function (row) {
      let entity = new Entity(row);
      entities.push(entity)
    })
  } else {
    console.log("No entities")
  }
  next(entities)
};

// getting all entities
let getEntities = function (next) {
  let query = "SELECT * FROM ENTITIES";
  db.executeNoBindReturnJson(query, dbToEntities, next)
};

module.exports = {
  getEntities: getEntities,
};