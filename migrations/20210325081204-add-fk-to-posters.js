'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
    // first argument is the name of the table to add the FK
    // 2nd argument is the name of the new column to be added in
    // 3rd argument: object of options
  return db.addColumn('posters', 'category_id', {
    'type':'int',
    'unsigned':true,
    'notNull':true,
     'foreignKey':{
         'name':'poster_category_fk',
         'table':'categories',
         'rules': {
             'onDelete':'cascade',
             'onUpdate':'restrict'
         }, 
         'mapping':'id'
     }
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
