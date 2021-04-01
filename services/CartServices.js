// this is the business logic that goes into Services folder
// it contains the following funcitonalities:
// 1. Add item to the cart 
// 2. Remove item from cart
// 3. Create Stripe payment 
// 4. Empty cart 


// import the cart item model 
const { CartItem } = require('../models')
const cartDataLayer = require('../dal/cart')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id
    }

    async getAll() {
        const allItems = await cartDataLayer.getAllItems(this.user_id)
        return allItems;
    }

    async addToCart(posterId) {
        // check if cart item exists in cart 
        // i.e. we are getting a cart item belonging to a user 
        // and having a certain product id
        const cartItem = await cartDataLayer
                        .getCartItemByUserAndPoster(this.user_id,posterId)
        //if the item does not exist, create 
        // and save it to cart
        if (!cartItem) {
            // ceate a row in the cart model
            let newCartItem = new CartItem();
            newCartItem.set('poster_id', posterId);
            newCartItem.set('user_id', this.user_id);
            newCartItem.set('quantity', 1);
            await newCartItem.save();
            return newCartItem
        } else {
            // if cart item already exist, 
            // increase the quantity of the poster by 1
            cartItem.set('quantity', cartItem.get('quantity') + 1);
            await cartItem.save();
            return cartItem;
        }

    }
}

module.exports = CartServices;