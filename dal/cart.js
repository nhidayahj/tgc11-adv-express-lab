// this is DATA ACCESS LAYER (DAL) relating to the cart services

const {CartItem} = require('../models')


const getAllItems = async(userId) => {
    // if more than 1 results, use .collection()
    const allItems = await CartItem.collection().where({
        'user_id':userId
    }).fetch({
        require:false,
        withRelated:['posters']
    })
    return allItems;
}

const getCartItemByUserAndPoster = async(userId, posterId) => {
    // when getting only 1 item, no need include .collection()
    const cartItem = await CartItem.where({
        'user_id':userId,
        'poster_id':posterId
    }).fetch({
        require:false,
        withRelated:['posters']
    })
    return cartItem;
}

const removeItem = async(userId, posterId) => {
    const item = await getCartItemByUserAndPoster(userId, posterId);
    if (item) {
        item.destroy();
        return true;
    }
    return false;
}

module.exports = {getAllItems, getCartItemByUserAndPoster, removeItem};