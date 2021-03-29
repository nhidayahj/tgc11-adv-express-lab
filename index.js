const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require('express-session')
const flash = require('connect-flash')
const csurf = require('csurf')

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

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
app.use(session({
    'secret':'whatever',
    'resave':false, // we will not resave the session
    'saveUninitialized': true
}))


// set up flash 
// enable after setting up session
app.use(flash())
//below sets up the (Flash) middle ware
app.use(function(req,res,next){
    // res.locals contains variables that hbs file can access
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    // remember to include next() otherwise application will hang
    next();
})

//setup csurf
app.use(csurf());
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
app.use(function(req,res,next) {
    res.locals.user = req.session.user;
    next();
})

app.use(function(req,res,next) {
    res.locals.csrfToken = req.csrfToken();
    next();
})

const landingRouter = require('./routes/landing')
const productsRouter = require('./routes/products')
const postersRouter = require('./routes/posters')
const userRouter = require('./routes/users')
const cloudinaryRouter = require('./routes/cloudinary')

async function main() {
  app.use('/', landingRouter)
  app.use('/products', productsRouter)
  app.use('/posters', postersRouter)
  app.use('/user', userRouter)
  app.use('/cloudinary', cloudinaryRouter)
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});