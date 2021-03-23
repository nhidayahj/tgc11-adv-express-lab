const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Posters', {
    'tableName':'posters'
});

module.exports = {Poster};