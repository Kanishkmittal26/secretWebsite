// env variables ..must be at top
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');

// LEVEL 6
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require( 'mongoose-findorcreate' );
// 

const app = express();


app.use(session({
    secret: 'our little secret',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');

// LEVEL 6 adding new fields to schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String 
})
// 

userSchema.plugin(passportLocalMongoose);
// LEVEL 6
userSchema.plugin(findOrCreate);
// 

const userModel = mongoose.model('user', userSchema);

passport.use(userModel.createStrategy());

// use static serialize and deserialize of model for passport session support
// LEVEL 6 changing serialize user and deserializer
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });
// Level 6


// Level 6
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    userModel.findOrCreate({ googleId: profile.id }).then((user, err)=> {
      return cb(err, user);
    });
  }
));
// 

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');




app.get("/", function (req, res) {
    res.render('home');
});

// Level 6
app.get("/auth/google" , 
    passport.authenticate("google",{ scope: ['profile'] })
);

app.get("/auth/google/secrets", 
    passport.authenticate("google",{failureRedirect : '/login'}),
    function(req,res){
            res.redirect('/secrets');
    }
)
// 

app.get("/login", function (req, res) {
    res.render('login');
});

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

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render('secrets');
    }
    else {
        res.redirect('/login');
    }
});

app.post("/register", function (req, res) {
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

app.get("/logout" , function(req,res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

app.listen(process.env.PORT || 3000, function () {
    console.log("server started at port 3000");
});

