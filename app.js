// env variables
require('dotenv').config();

// this console is done to check whether we can connect to .env file 
// console.log(process.env.API_KEY);

const express = require('express');
const app = express();

const mongoose = require('mongoose');
// LEVEL 2
const encrypt = require( 'mongoose-encryption' );

mongoose.connect('mongodb://localhost:27017/userDB');

// LEVEL 1
// const userSchema = {
//     email: String,
//     password: String
// };

// modified LEVEL 1 i.e LEVEL 2
const userSchema = new mongoose.Schema({
    email : String,
    password : String
})
// environment variables to comment out const secretEncryption and go to .env file
// const secretEncrytion = "Random String";
// userSchema.plugin(encrypt , {secret : secretEncrytion , encryptedFields : ["password"]});

// env variable
userSchema.plugin(encrypt , {secret : process.env.SECRETENCRYPTION , encryptedFields : ["password"]});


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
    const userName = req.body.username;
    const passWord = req.body.password;

    userModel.findOne({ email: userName }).then((data, err) => {
        if (data) {
            if (data.password === passWord) {
                res.render('secrets');
            }
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
    const newUser = new userModel({
        email: req.body.username,
        password: req.body.password
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


app.listen(process.env.PORT || 3000, function () {
    console.log("server started at port 3000");
});

