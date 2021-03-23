const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

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

const landingRouter = require('./routes/landing')
const productsRouter = require('./routes/products')
const postersRouter = require('./routes/posters')

async function main() {
  app.use('/', landingRouter)
  app.use('/products', productsRouter)
  app.use('/posters', postersRouter)
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});