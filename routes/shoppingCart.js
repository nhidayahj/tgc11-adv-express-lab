const express = require('express');
const router = express.Router()

// import in modules 
const CartServices = require('../services/CartServices')


// create the route for shopping cart

// show all the items by a certain user
router.get('/', async(req,res) => {
    // console.log(req.session.user.id)
    let cartServices = new CartServices(req.session.user.id);
    const allItems = await cartServices.getAll();
    req.flash("Item has been added to your cart.")
    res.render('shoppingCart/index', {
        'allItems':allItems.toJSON()
    })
})



// add items into shopping cart
router.get('/:poster_id/add', async (req,res)=>{
    // create an instance to save the user id first
    // to test the below line of code, user MUST be logged in to get the session id
    // req.session.user is the data that we saved in the user.js file when user successfully logs in
    let cartServices = new CartServices(req.session.user.id) 
    await cartServices.addToCart(req.params.poster_id);
    req.flash('success_messages', "Item successfully added into cart")
    // res.send('adding items into cart')
    res.redirect('back')
})


router.get('/:poster_id/remove', async (req,res) => {
    let cartServices = new CartServices(req.session.user.id);
    await cartServices.removeCartItem(req.params.poster_id);
    req.flash('success_messages', "Poster is removed from shopping cart");
    res.redirect('back')
})

// updating quantity in shopping cart 
router.post('/:poster_id/quantity/update', async (req,res) => {
    let cartServices = new CartServices(req.session.user.id);
    // below line gets the posterId and retrieve the value of the quantity
    // make sure in shoppingCart hbs, there is a 'name' attribute called quantity
    // to retrieve the information
    await cartServices.updateQuantity(req.params.poster_id, req.body.quantity);
    req.flash("success_messages", "Quantity has been updated");
    res.redirect('back')
})

module.exports = router;