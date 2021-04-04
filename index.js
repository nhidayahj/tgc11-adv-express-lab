const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require('express-session')
// below dependency "FileStore" uses a file-based to store our sessions
//(useful when testing logging in issues)
const FileStore = require('session-file-store')(session)
const flash = require('connect-flash')
const csurf = require('csurf')
// cors is only for browser use
const cors = require('cors')

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

app.use(cors())

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// set up session 
// ** IMPT: Remember to include "sessions/" in .gitignore file
// as it contains the recorded session user
app.use(session({
    'store': new FileStore(),
    'secret': process.env.SESSION_SECRET_KEY,
    'resave': false, // we will not resave the session
    'saveUninitialized': true
}))


// set up flash 
// enable after setting up session
app.use(flash())
//below sets up the (Flash) middle ware
app.use(function (req, res, next) {
    // res.locals contains variables that hbs file can access
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    // remember to include next() otherwise application will hang
    next();
})

//setup csurf
const csurfInstance = csurf();
app.use(function (req, res, next) {
    // exclude /checkout/process_payment for CSRF
    // we also exclude if the route has '/api/' because 
    // sending from/to API has no cookies or session involve
    // hence no CSRF token
    if (req.url === '/checkout/process_payment' || 
        req.url.slice(0,5) == '/api/') {
        // go to the next middleware
        return next()
    } else {
        csurfInstance(req, res, next)
    }
})

app.use(function (err, req, res, next) {
    if (err && err.code == "EBADCSRFTOKEN") {
        req.flash('error_messages', 'The form has expired. Please try again');
        res.redirect('back');
    } else {
        console.log("going next");
        next()
    }
});

// global middleware to inject the req.session.user
// object into the local varibales (i.e. variables accessible by hbs files)
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
})

app.use(function (req, res, next) {
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    } 
    next()
})

const landingRouter = require('./routes/landing')
const productsRouter = require('./routes/products')
const postersRouter = require('./routes/posters')
const userRouter = require('./routes/users')
const cloudinaryRouter = require('./routes/cloudinary')
const shoppingRouter = require('./routes/shoppingCart')
const checkoutRouter = require('./routes/checkout')

// create an API object that contains all the routes 
// relating to API routes
const api = {
    'posters':require('./routes/api/posters'),
    'users':require('./routes/api/users')
}

async function main() {
    app.use('/', landingRouter)
    app.use('/products', productsRouter)
    app.use('/posters', postersRouter)
    app.use('/user', userRouter)
    app.use('/cloudinary', cloudinaryRouter)
    app.use('/shoppingCart', shoppingRouter)
    app.use('/checkout', checkoutRouter)
    // in API route, the 2nd argument has a .json() to make sure
    // that data send from/to an API is in a json format.
    // express.json() is a middleware func in Express 
    app.use('/api/posters', express.json(), api.posters)
    app.use('/api/user', express.json(), api.users)
}

main();

app.listen(3000, () => {
    console.log("Server has started");
});