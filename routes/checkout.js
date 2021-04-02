const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const CartServices = require('../services/CartServices')

router.get('/checkout', async (req, res) => {

    // 1. create line items -- tell Stripe what the customer is paying for
    const cartService = new CartServices(req.session.user.id);
    let allCartItems = await cartService.getAll();

    // here - read the Stripe Checkout Session documentation
    // of Stripe keys
    // lineItems is an object that MUST be sent to Stripe
    let lineItems = [];
    let meta = [];

    for (let cartItem of allCartItems) {
        // the 'related' is because our cartItem in models.js has a 
        // r/s with the posters 
        const lineItem = {
            // the lineItem has a specific key names that Stripes needs to check
            'name': cartItem.related('posters').get('title'),
            // the amount captures CENTS
            'amount': cartItem.related('posters').get('cost'),
            'currency': 'SGD',
            'quantity': cartItem.get('quantity')
        }
        // must also check if poster has an image Url,
        // since Stripe also require to have an image_url key
        if (cartItem.related('posters').get('image_url')) {
            lineItem.images = [cartItem.related('posters').get('image_url')];
        }
        // then add the lineItem oject to the lineItems array that Stripe require
        lineItems.push(lineItem);
        // meta keeps track for each poster, and the quantity left
        meta.push({
            'poster_id': cartItem.get('poster_id'),
            'quantity': cartItem.get('quantity')
        })
    }


    // 2. using Stripe, create the payment
    // why stringify? when sending data to a web server, it MUST be in string
    // therefore, metaData is the string form of meta
    let metaData = JSON.stringify(meta)
    // the keys for payment object is set by Stripe, hence MUST follow
    const payment = {
        'payment_method_types': ['card'],
        'line_items': lineItems,
        'success_url': process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        'cancel_url': process.env.STRIPE_ERROR_URL,
        'metadata': {
            'orders': metaData
        }

    }
    // 3. register the payment
    let stripeSession = await stripe.checkout.sessions.create(payment);

    // 4. send the payment session ID back to a hbs file, and use JS to redirect
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })


})


module.exports = router;
