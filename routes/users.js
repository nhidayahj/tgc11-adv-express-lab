const express = require('express');
const router = express.Router();
// below is the nodejs built-in crypto module to create the hashed version of users'
// password
const crypto = require('crypto');

// import the user model
const {User} = require('../models');

// import the user registration form & bootstrapField
const {createRegisterForm, createLoginForm, bootstrapField} = require('../forms')

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


router.get('/register', (req,res) => {
    // display the registration form
    const registerForm = createRegisterForm();
    res.render('users/register', {
        'form':registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req,res)=>{
    const registerForm = createRegisterForm();
    registerForm.handle(req, {
        'success': async(form) => {

                // using form.data wont work because 
                // our users table do not have the confirm_password column
                // but exists in out form.data form

                // 'username':form.data.username,
                // 'email':form.data.email,
                // 'password':form.data.password

                let {confirm_password, ...userData} = form.data;
                userData.password = getHashedPassword(userData.password)
                const user = new User(userData);
                await user.save()
           
                req.flash('success_messages', "Successful Registration");
                res.redirect('/user/login')
        }, 
        'error': (form) => {
            res.render('users/register', {
                'form':form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req,res) => {
    const loginForm = createLoginForm();
    res.render('users/login', {
        'form':loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async(req,res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async(form) => {
            
            // process the login form
            // find the user by their email & password
            let user = await User.where({
                'email':form.data.email
            }).fetch({
                'require':false
            })

            // if user does not exists
            if (!user) {
                req.flash('error_messages', "User is not found. Please try again.")
                res.redirect('/user/login')
            } else {
                // user email exists
                // now check if password matches 
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    // add to the session that the login is successful
                    // store user details
                    req.session.user = {
                        id:user.get('id'),
                        username:user.get('username'),
                        email:user.get('email')
                    }
                    req.flash('success_messages', 'Welcome back ' + user.get('username'))
                    res.redirect('/posters/all-posters')
                } else {
                    // password does not match
                    req.flash('error_messages', "Failed to log in. Password / Email is incorrect.")
                    res.redirect('user/login')
                }
            }
        }, 
        'error': (form) => {
            req.flash('error_messages', "There are problems loggin you in. Please fill in form again")
            res.render('users/login', {
                'form':form.toHTML(bootstrapField)
            })
        }
    })
})


module.exports = router; 