const jwt = require('jsonwebtoken')


const checkIfAuthenticated = (req,res, next) => {
    if (req.session.user) {
        // if the middleware executes successfully,
        // call next()
        next();
    } else {
        req.flash('error_messages', 'Please sign in or register to access this page')
        res.redirect('/user/login')
        // so if there's an error or a failure
        // don't call next()
    }
}

// when testing with ARC,
// user Headers tabs, header name to be Authorization
// ** Remember to have the key "Bearer " (with a space) and copy-paste
// the accessToken of that user

const checkIfAuthenticatedJWT = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.TOKEN_SECRET, (err,user) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.user = user;
                next();
            }
        })
    } else {
        res.status(401)
        res.send({
            'error':"No authorized access"
        })
    }
}


module.exports = {checkIfAuthenticated, checkIfAuthenticatedJWT};