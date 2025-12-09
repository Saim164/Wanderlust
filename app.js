if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { createSecretKey } = require("crypto");
const { serialize } = require("v8");

const dbUrl = process.env.ATLASDB_URL;


main().then( () => {
    console.log("connection successful");
})
.catch((err) => {
    console.log(err)
});

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOveride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const port = 8080;

const store = MongoStore.create({
    mongoUrl : dbUrl,
    // crypto :{
    // secret : "mysecret",
    // },
    touchAfter : 24*3600,
});

store.on ("error" , (err)=>{
    console.log("ERROR IN MONGO SESSION STORE" , err);
})

const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : new Date(Date.now()+7*24*60*60*1000),
        maxAge : 7*24*60*60*1000,
        httpOnly :true
    }
};


app.use(session(sessionOption));
app.use(flash());


// app.get( "/" , ( req , res ) => {
//     res.send("working")
// })


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter)

app.use((err,req,res,next) => {
    let {statusCode =500 , message="Something went wrong"} = err;
    res.render("error.ejs" , {err});
})

app.get('/', (req, res) => {
  res.redirect('/listings'); // redirect root to /listings
});

app.listen( 8080 , () => {
    console.log("listening to port" , port);
})