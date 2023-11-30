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

require("./config/passport")(passport);

app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}));
const db= process.env.MONGO_CONNECTION;
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
const secret=process.env.SECRET;



app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.use((req,res,next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
})


mongoose.connect(db)
.then(() => console.log("alll ok"))
.catch(err => console.log(err));

const User = require("./models/User.js")

app.get("/", function(req,res){
   res.render("login");
})


app.get("/login",function(req,res){
  res.render("login");
});

app.get("/signup",function(req,res){
  res.render("signup");
});

const {ensureAuthenticated} = require("./config/auth.js");

app.get("/iasweb",ensureAuthenticated,(req,res) => {
  const thisEmail = req.user.email;
  User.findOne({email: thisEmail}, function(err, foundUser){
    if(!err){
      res.render("todo",{
        listItems:foundUser.lists,userEmail: thisEmail
      })
    }
  })

});

app.post("/iasweb", function(req,res){
  const itemName = req.body.newItem;
  const thisEmail = req.body.btn;
  User.findOne({email:thisEmail}, async function(err,foundUser){
    if(err){
      console.log(err);
    } else{
      if(itemName === ""){
        res.redirect("/iasweb");
      }else{
        foundUser.lists.push(itemName);
        await foundUser.save();
        res.redirect("/iasweb");
      }

    }
  })
})


app.post("/login", (req,res, next) => {
  passport.authenticate("local", {
    successRedirect: "/iasweb",
    failureRedirect: "/login",
    failureFlash: true
  })(req,res,next);
});


app.post("/signup",function(req,res){
  const{ username, email, password, cpassword }= req.body;
  let errors = [];
  if(!username || !email || !password || !cpassword){
    errors.push({msg: 'Please fill in all fields' });
    // console.log("required");
  }

  if(password !== cpassword){
    errors.push({msg: "Passwords do not match"});
  }

  if(password.length<8){
    errors.push({msg: "Password should be atleast 8 characters"});
  }

  if(errors.length>0){
    res.render("signup",{
      errors,username,email,password,cpassword
    });
  }else{
    User.findOne({email:email})
    .then(user => {
      if(user){
        errors.push({msg:"Email is already registered"})
        res.render("signup",{
          errors,username,email,password,cpassword
        });
      } else{
        const newUser = new User({
          "username" : username,
          "email" : email,
          "password" : password,
        });

        bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) =>{
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
           .then(user => {
             req.flash("success_msg","successfully registered. Please login");
             res.redirect("/login");
           })
           .catch(err => console.log(err));

        }))
      }
    });
  }
});














app.listen(3000, function(){
  console.log("server is running on port 3000");
})
