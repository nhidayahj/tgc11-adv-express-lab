const express = require('express')

const router = express.Router()


router.get('/all-products', (req,res) => {
    res.render('products/products')
})

module.exports = router;