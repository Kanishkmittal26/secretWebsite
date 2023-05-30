// env variables
require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');

// LEVEL 5
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
app.use(session({
    secret: 'our little secret',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');

// Level 5
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);

const userModel = mongoose.model('user', userSchema);

passport.use(userModel.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

const bodyParser = require('body-parser');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const ejs = require('ejs');
app.set('view engine', 'ejs');


app.get("/", function (req, res) {
    res.render('home');
});

app.get("/login", function (req, res) {
    res.render('login');
});

// Level 5
app.post("/login", function (req, res) {

    const user = new userModel({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
        passport.authenticate("local")(req, res, function () {
            res.redirect('/secrets');
            })
        }
    });
})


app.get("/register", function (req, res) {
    res.render('register');
});

// Level 5
app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render('secrets');
    }
    else {
        res.redirect('/login');
    }
});

app.post("/register", function (req, res) {
    // Level 5
    userModel.register(
        { username: req.body.username }, req.body.password).then((data, err) => {
            if (err) {
                console.log(err);
                res.redirect('/register');
            }
            else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect('/secrets');
                });
            }
        });
});

// Level 5
app.get("/logout" , function(req,res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

app.listen(process.env.PORT || 3000, function () {
    console.log("server started at port 3000");
});

