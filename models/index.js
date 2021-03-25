const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Posters', {
    'tableName':'posters',
    category() {
        // the argument is the name of the model, (not the table)
        return this.belongsTo('Category')
    }
});

const Category = bookshelf.model('Category', {
    'tableName':'categories',
    posters() {
        return this.hasMany('Poster')
    }
})

module.exports = {Poster, Category};