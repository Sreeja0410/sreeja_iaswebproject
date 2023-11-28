require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const ejs=require("ejs");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs")
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");

const app = express();

//const db= require("./config/keys.js").MongoURI;

// app.use(session({
//   //secret: process.env.SECRET,
//   store: MongoStore.create({ mongoUrl: MongoUR }),
//   resave: true,
//   saveUninitialized: true
// }));
const db= process.env.MONGO_CONNECTION;
app.set('view engine', 'ejs');

app.use(express.static("public"));

mongoose.connect(db)
.then(() => console.log("alll ok"))
.catch(err => console.log(err));

app.get("/", function(req,res){
   res.render("login");
})

app.listen(3000, function(){
  console.log("server is running on port 3000");
})
