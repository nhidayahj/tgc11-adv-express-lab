const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Posters', {
    'tableName':'posters',
    category() {
        // the argument is the name of the model, (not the table)
        return this.belongsTo('Category')
    }, 
    tags(){
        return this.belongsToMany('Tag')
    }
});

const Category = bookshelf.model('Category', {
    'tableName':'categories',
    posters() {
        return this.hasMany('Poster')
    }
})

const Tag = bookshelf.model('Tag', {
    'tableName':'tags',
    posters(){
        return this.belongsToMany('Poster')
    }
})


const User = bookshelf.model('User', {
    'tableName':'users'
})

const CartItem = bookshelf.model('CartItem', {
    'tableName':'cart_items',
    posters() {
        return this.belongsTo('Posters')
    }, 
    user() {
        return this.belongsTo('User')
    }
})


module.exports = {Poster, Category, Tag, User, CartItem};