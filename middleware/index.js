const checkIfAuthenticated = (req,res, next) => {
    if (req.session.user) {
        // if the middleware executes successfully,
        // call next()
        next();
    } else {
        req.flash('error_messages', 'You need ti sign in to access this page')
        res.redirect('/user/login')
        // so if there's an error or a failure
        // don't call next()
    }
}

module.exports = {checkIfAuthenticated};