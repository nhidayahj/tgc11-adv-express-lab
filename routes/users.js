const express = require('express')
const router = express.Router()

// import the user model
const {User} = require('../models');

// import the user registration form & bootstrapField
const {createRegisterForm, bootstrapField} = require('../forms')

router.get('/register', (req,res) => {
    // display the registration form
    const registerForm = createRegisterForm();
    res.render('users/register', {
        'form':registerForm.toHTML(bootstrapField)
    })
})


module.exports = router; 