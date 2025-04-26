const express = require('express');
const router = express.Router();

// Auth Routes
const bcrypt = require("bcrypt");
const {User} = require("../models");
const passport = require("passport");

router.get('/register', (req, res) => {
    res.render('register',  { error: null });
});

router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            password: hashedPassword,
            email,
            role: 'USER'
        });

        req.login(user, (err) => {
            if (err) {
                return res.redirect('/register');
            }
            return res.redirect('/');
        });
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Registration failed. Username may be taken.' });
    }
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login', { error: req.flash('error') });
});


router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;
