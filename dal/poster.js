// this is a DATA ACCESS LAYER (DAL) for posters domain
// DAL is a module file name that accesses data from a DATABASE
// compile functions that is related to extracting data from a DATABASE

const { Poster, Category, Tag } = require('../models')

// must be in an async function 

// get poster by its id
const getPosterById = async (posterId) => {
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true,
        'withRelated':['tags']
    });
    return poster;
}

// get all categories
const getAllCategories = async () => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    })
    return allCategories;
}

// get all tags
const getAllTags = async () => {
    const allTags = await Tag.fetchAll().map((tag) => {
        return [tag.get('id'), tag.get('name')]
    })
    return allTags;
}



module.exports = { getAllCategories, getAllTags, getPosterById }