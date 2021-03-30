// this is a DATA ACCESS LAYER (DAL) for posters domain

const { Poster, Category, Tag } = require('../models')

// must be in an async function 

// get poster by its id
const getPosterById = async (posterId) => {
    return await Poster.where({
        'id': posterId
    }).fetch({
        'require': true,
        'withRelated':['tags', 'category']
    });
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