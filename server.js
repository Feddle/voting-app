
const express = require("express");
const mongo = require("mongodb").MongoClient;
const nunjucks = require("nunjucks");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const url = "mongodb://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+":"+process.env.DB_PORT+"/"+process.env.DB_NAME;
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'))


nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.get("/", (req, res, next) => {
  mongo.connect(url, (err, client) => {
    if (err) next(err);
    else {
      console.log("Connection established to database");
      const glitch_db = client.db("glitch");
      const coll = glitch_db.collection("votingAppPolls");       
      coll.find().toArray((err, polls) => {              
        if(err) next(err);
        if(!polls) next(err);
        else {                    
          res.render("index.html", {polls: polls});          
        }
        client.close();
      });            
    }
  });        
});

app.get("/new", (req, res) => {
  res.render("newPoll.html");
});

app.post("/new", urlencodedParser, (req, res, next) => {
  if (!req.body) return res.sendStatus(400);  
  mongo.connect(url, (err, client) => {
    if (err) next(err);
    else {
      console.log("Connection established to database");
      const glitch_db = client.db("glitch");
      const coll = glitch_db.collection("votingAppPolls");       
      let title = req.body.pollTitle;
      let options = req.body.options.split(/\r\n|\r|\n/g);
      let link = crypto.randomBytes(3).toString('hex');
      let obj = {"title": title, "options": options, "link": link};
      coll.insert(obj, (err, data) => {
        if(err) res.send(err);
        else res.redirect("/poll/"+link);
        client.close();
      });            
    }
  });   
  
  
  
});

app.get("/poll/:link", (req, res, next) => {
  mongo.connect(url, (err, client) => {
    if (err) next(err);
    else {
      console.log("Connection established to database");
      const glitch_db = client.db("glitch");
      const coll = glitch_db.collection("votingAppPolls");       
      coll.findOne({link: req.params.link}, (err, doc) => {              
        if(err) next(err);
        if(!doc) next(err);
        else {                    
          res.render("viewPoll.html", {poll: doc});          
        }
        client.close();
      });            
    }
  });          
});


app.get("*", (req, res) => {
  res.status(404).end("Page not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
});



const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
});


