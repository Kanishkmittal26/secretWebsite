// env variables
require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');

// LEVEL 4
const bcrypt = require('bcrypt');
const saltRounds = 10;


mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})



const userModel = mongoose.model('user', userSchema);

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

app.post("/login", function (req, res) {
    // LEVEL 4
    const userName = req.body.username;
    const passWord = req.body.password;

    userModel.findOne({ email: userName }).then((data, err) => {
        if (data) {
            bcrypt.compare(passWord, data.password).then(function (result) {
                if(result===true){
                    res.render('secrets');
                }
            });
        }
        else {
            console.log(err);
        }
    });
})


app.get("/register", function (req, res) {
    res.render('register');
});

app.post("/register", function (req, res) {
    // LEVEL 4
    bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
        // Store hash in your password DB.
        const newUser = new userModel({
            email: req.body.username,
            password: hash
        })
        newUser.save().then((data, err) => {
            if (data) {
                res.render('secrets');
            }
            else {
                console.log(err);
            }
        });
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log("server started at port 3000");
});

