const express = require('express')
const router = express.Router()
const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users.js')

router.get('/register', users.renderRegisterForm)



router.post('/register', catchAsync(users.register))

router.get('/login', users.renderLogin)

router.post("/login", storeReturnTo, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), users.userLogin);

router.get('/logout', users.userLogout)

module.exports = router;