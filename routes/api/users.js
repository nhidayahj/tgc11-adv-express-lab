const express = require('express')
const router = express.Router();
// nodejs already has a builtin 'crypto'
const crypto = require('crypto')
const jwt = require('jsonwebtoken');

const {User} = require('../../models')
const {checkIfAuthenticatedJWT} = require('../../middleware')

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.TOKEN_SECRET, {
        'expiresIn': '1h'
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// in this api router approach, 
// it create a JWT to authorized using API 
// however, in the login for web-based form, we saved it in req.session.user
// see (POST users.js) under the forms validation
router.post('/login', async(req,res) => {
    // assuming user is logging in using email & pwd 
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        'require':false
    });

    // if the user exists and the password matches
    // CHECK: see replt.it example on jwt-decode
    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        // we can pass in ANYTHING in the user object, 
        // to create the jwt token (e.g todays' date, DOB, etc)
        let accessToken = generateAccessToken({
            'username':user.get('username'),
            'email':user.get('email'),
            'id': user.get('id')
        })
        res.send({
            "accessToken":accessToken
        })
    } else {
        res.sendStatus(401)
        res.send({
            'error':"invalid email or password"
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, (req,res) => {
    let user = req.user
    res.send(user)
})

module.exports = router;