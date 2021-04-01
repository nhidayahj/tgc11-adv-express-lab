const express = require('express');
const router = express.Router();
// below is the nodejs built-in crypto module to create the hashed version of users'
// password
const crypto = require('crypto');

// import the user model
const { User } = require('../models');

// import the user registration form & bootstrapField
const { createRegisterForm, createLoginForm, bootstrapField } = require('../forms')

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


router.get('/register', (req, res) => {
    // display the registration form
    const registerForm = createRegisterForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    const registerForm = createRegisterForm();
    registerForm.handle(req, {
        'success': async (form) => {

            // using form.data wont work because 
            // our users table do not have the confirm_password column
            // but exists in out form.data form

            // 'username':form.data.username,
            // 'email':form.data.email,
            // 'password':form.data.password

            let { confirm_password, ...userData } = form.data;
            userData.password = getHashedPassword(userData.password)
            const user = new User(userData);
            await user.save()

            req.flash('success_messages', "Successful Registration");
            res.redirect('/user/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req, res) => {
    const loginForm = createLoginForm();
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})


router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    console.log("entered")
    loginForm.handle(req, {
        'success': async (form) => {
            
            // 1. find the user based on the email address
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require:true
            });

            // 2. if the user exists, check if the password
            // matches
            if (user) {
                // 3a. if the password matches, then authenticate the user
                // i.e, save the user data to the session
                if (user.get('password') == getHashedPassword(form.data.password)) {
                    // save the user data to the session
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash('success_messages', `Welcome back, ${req.session.user.username}`);
                    res.redirect('/posters/all-posters');

                } else {
                    console.log("password not found")
                    req.flash('error_messages', 'Please double check your email and password');
                    res.send("Password does not match")
                }
            } else {
                console.log("user not")
                // 3b. the user is found
                // redirect to the login page with an error message
                req.flash('error_messages', 'Please double check your email and password');
                res.redirect('/user/login');
               
            }
        },
        'error': (form) => {
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            });
        }
    })
})

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        // current user has not logged in
        req.flash('error_messages', "Please login first");
        res.redirect('/user/login')
    } else {
        res.render('users/profile', {
            'user': req.session.user
        })
    }
})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', 'Bye bye');
    res.redirect('/users/login')
})


module.exports = router; 