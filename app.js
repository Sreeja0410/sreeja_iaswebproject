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

const db= process.env.MONGO_CONNECTION;
//app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: process.env.SECRET,
  //store: MongoStore.create({ mongoUrl: MongoUR }),
  resave: true,
  saveUninitialized: true
}));

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
const Topper = require("./models/Topper.js")

app.get("/",function(req,res){
  res.render("login");
});



app.get("/login",function(req,res){
  res.render("login");
});


app.get("/signup",function(req,res){
  res.render("signup");
});

const {ensureAuthenticated} = require("./config/auth.js");

app.get("/iasweb", ensureAuthenticated, (req, res) => {
    const thisEmail = req.user.email;
    User.findOne({ email: thisEmail })
      .then(foundUser => {
        if (!foundUser) {
          return res.status(404).send("User not found");
        }

        res.render("iasweb", {
          //listItems: foundUser.lists,
          userEmail: thisEmail
        });
      })
      .catch(err => {
        console.error(err);
        // Handle any other errors that may occur
        res.status(500).send("Internal Server Error");
      });
  });

  app.post("/iasweb", function(req,res){
    const thisEmail = req.body.btn;
    User.findOne({email:thisEmail}, async function(err,foundUser){
      if(err){
        console.log(err);
      } else{
        res.render("iasweb")
      }
    })
  })

app.get("/iasweb/addtopper",ensureAuthenticated,(req, res) => {
  res.render("addtopper");
});

app.post("/iasweb/addtopper", (req, res) => {

  const {
    name,
      rank,
      year,
      gs1,
      gs2,
      essaymarks,
      gsmarks,
      csatmarks,
      opt,
      optmarks,
      remarks
  } = req.body;


  const newTopper = new Topper({
    name,
    rank,
    year,
    gs1Marks:gs1,
    gs2Marks:gs2,
    essayMarks:essaymarks,
    prelimsGSMarks: gsmarks,
    prelimsCSATMarks: csatmarks,
    optionalSubject: opt,
    optional1Marks: optmarks,
    remarks
  });


  newTopper.save()
    .then(savedTopper => {
      //console.log('Topper saved to the database:', savedTopper);
       req.flash("success_msg","successfully added a topper");
      res.redirect('/iasweb');
    })
    .catch(error => {
      console.error('Error saving Topper to the database:', error);
      res.status(500).send('Internal Server Error');
    });
});


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




const PORT = process.env.PORT || 3000;
app.listen(PORT,function(){
  console.log("server is running on port 3000");
});
