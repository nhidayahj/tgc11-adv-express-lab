const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require('express-session')
const flash = require('connect-flash')

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
//below sets up the middle ware
app.use(function(req,res,next){
    // res.locals contains variables that hbs file can access
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    // remember to include next() or application will hang
    next();
})

const landingRouter = require('./routes/landing')
const productsRouter = require('./routes/products')
const postersRouter = require('./routes/posters')
const userRouter = require('./routes/users')

async function main() {
  app.use('/', landingRouter)
  app.use('/products', productsRouter)
  app.use('/posters', postersRouter)
  app.use('/user', userRouter)
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});