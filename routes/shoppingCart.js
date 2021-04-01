const express = require('express');
const router = express.Router()

// import in modules 
const CartServices = require('../services/CartServices')


// create the route for shopping cart

// get all the items by a certain user
router.get('/', async(req,res) => {
    let cartServices = new CartServices(req.session.user.id);
    const allItems = await cartServices.getAll();
    res.render('shoppingCart/index', {
        'allItems':allItems.toJSON()
    })
})

// add items into shopping cart
router.get('/:poster_id/add', async (req,res)=>{
    // create an instance to save the user id first
    // to test the below line of code, user MUST be logged in to get the session id
    let cartServices = new CartServices(req.session.user.id) 
    await cartServices.addToCart(req.params.poster_id);
    req.flash('success_messages', "Item successfully added into cart")
    // res.send('adding items into cart')
    res.redirect('back')



})

module.exports = router;