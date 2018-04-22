
const express = require("express");
const nunjucks = require("nunjucks");
const helmet = require("helmet");
const passport = require("passport");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth-routes");
const passportSetup = require("./config/passport-setup");
const Poll = require("./models/poll-model");
const User = require("./models/user-model");

const app = express();
const url = "mongodb://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+":"+process.env.DB_PORT+"/"+process.env.DB_NAME;
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(helmet());
app.use(express.static("public"))
app.use(cookieParser());


nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(url, () => {
    console.log('connected to mongodb');
});

app.use("/auth", authRoutes);


//route for homepage
app.get("/", (req, res, next) => {
  Poll.find({private: false}, (err, polls) => {    
    res.render("index.html", {polls: polls, user: req.user});
  });
});


//route for newPoll page
app.get("/new", (req, res) => {
  res.render("newPoll.html", {user: req.user});
});

//route for posting new poll
app.post("/new", urlencodedParser, (req, res, next) => {
  if (!req.body) return res.sendStatus(400);    
  else {          
    let title = req.body.pollTitle;
    let options = req.body.options.split(/\r\n|\r|\n/g);
    let optionsObj = {};      
    let link = crypto.randomBytes(3).toString('hex');  
    let isPrivate = req.body.checkBoxPrivate ? true : false;
    for(let option of options) optionsObj[option] = 0;    
    if(req.user) User.updateOne({_id: req.user.id}, {$push: {polls: link}}).then((err, success) => console.log(err));
    new Poll({
      title: title,
      options: optionsObj,
      link: link,
      private: isPrivate
    }).save().then(res.redirect("/poll/"+link));     
  }  
});


//route for poll page
app.get("/poll/:link", (req, res, next) => {    
  let bool = false;
  if(req.user) bool = req.user.polls.includes(req.params.link)
  Poll.findOne({link: req.params.link}).then((poll) => {
    if(!poll) next();
    if(req.cookies.polls && req.cookies.polls.includes(req.params.link)) res.render("viewPoll.html", {poll: poll, user: req.user, isOwner: bool, hasVoted: true});
    else res.render("viewPoll.html", {poll: poll, user: req.user, isOwner: bool});
  })
});


//route for poll deletion
app.get("/poll/:link/delete", urlencodedParser, (req, res, next) => {         
  if(req.user && req.user.polls.includes(req.params.link))  
  Poll.deleteOne({"link": req.params.link}).then(res.redirect("/"));
  User.updateOne({_id: req.user.id}, {$pullAll: {polls: [req.params.link]}}).then((err, success) => console.log(err));
});

//route for vote posting
app.post("/poll/:link", urlencodedParser, (req, res, next) => {
  if (!req.body) return res.sendStatus(400);     
  if(req.cookies.polls && req.cookies.polls.includes(req.params.link)) res.redirect("/poll/"+req.params.link);
    else {                  
      let vote = req.body.customOption ? req.body.customOption : req.body.vote;      
      Poll.updateOne({"link": req.params.link}, {$inc: {["options."+vote]: +1}}).then(() => {        
        let p = req.cookies.polls ? req.cookies.polls + "," + req.params.link : req.params.link;          
        res.cookie("polls", p, { expires: new Date("2032-12-17T03:24:00"), httpOnly: true });      
        res.redirect("/poll/"+req.params.link);
      });
      
    }
});


//route for mypolls page
app.get("/mypolls", (req, res) => {
  if(!req.user) res.render("myPolls.html");
  else
  User.findById(req.user.id, "polls", (err, userPolls) => {
    if(err) console.log(err);
    Poll.find({link: {$in: userPolls.polls}}).then((resultPolls) => res.render("myPolls.html", {polls: resultPolls, user: req.user}));    
  });  
});


//default route
app.get("*", (req, res) => {
  res.status(404).end("Page not found");
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
});



const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});


