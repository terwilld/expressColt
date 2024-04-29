const passport = require('passport')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user.js')
const { storeReturnTo } = require('../middleware');

module.exports.renderRegisterForm = (req, res) => {
    console.log('I am in the register form controller')
    res.render('users/register.ejs')
}


module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const newUser = new User({ email, username })
        const registeredUser = await User.register(newUser, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login.ejs')
}

module.exports.userLogin = (req, res) => {
    req.flash('success', 'Welcome back')
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo
    console.log(`this is where I'm redirecting to ${redirectUrl}`)
    res.redirect(redirectUrl)
}

module.exports.userLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged you out')
        res.redirect('/campgrounds')
    });
}