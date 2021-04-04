const express = require('express')
const router = express.Router();
// nodejs already has a builtin 'crypto'
const crypto = require('crypto')
const jwt = require('jsonwebtoken');

const { User, BlacklistedToken } = require('../../models')
const { checkIfAuthenticatedJWT } = require('../../middleware')

const generateAccessToken = (user, secret, expiresIn) => {
    return jwt.sign(user, secret, {
        'expiresIn': expiresIn
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
router.post('/login', async (req, res) => {
    // assuming user is logging in using email & pwd 
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        'require': false
    });

    // if the user exists and the password matches
    // CHECK: see replt.it example on jwt-decode
    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        // we can pass in ANYTHING in the user object, 
        // to create the jwt token (e.g todays' date, DOB, etc)
        let accessToken = generateAccessToken({
            'username': user.get('username'),
            'email': user.get('email'),
            'id': user.get('id')
        }, process.env.TOKEN_SECRET, '15m')

        let refreshToken = generateAccessToken({
            'username': user.get('username'),
            'email': user.get('email'),
            'id': user.get('id')
        }, process.env.REFRESH_TOKEN_SECRET, '7d')

        res.send({
            "accessToken": accessToken,
            "refreshToken": refreshToken
        })
    } else {
        res.sendStatus(401)
        res.send({
            'error': "invalid email or password"
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, (req, res) => {
    let user = req.user
    res.send(user)
})

router.post('/refresh', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401)
        res.send({
            'error': 'Not authorized'
        })
    }

    // check if the refresh token has been blacklisted 
    let blacklistedToken = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })

    if (blacklistedToken) {
        res.status(401);
        res.send({
            'message':"Refresh token is expired"
        })
        return;
    }


    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.sendStatus(403);
        } else {
            let accessToken = generateAccessToken({
                'username': user.username,
                'email': user.email,
                'id': user.id
            }, process.env.TOKEN_SECRET, '14m')
            res.send({
                'accessToken': accessToken
            })
        }
    })
})

router.post('/logout', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(403)
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                res.sendStatus(403)
            } else {
                const token = new BlacklistedToken();
                token.set('token', refreshToken);
                token.set('created_date', new Date());
                await token.save();
                res.send({
                    'message': 'User successfully logged out.'
                })
            }
        })
    }
})

module.exports = router;