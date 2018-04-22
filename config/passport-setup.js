const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new TwitterStrategy({        
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: "/auth/twitter/redirect"
    }, (token, tokenSecret, profile, done) => {           
        User.findOne({twitterId: profile.id}).then((currentUser) => {
            if(currentUser){                
                done(null, currentUser);
            } else {                
                new User({
                    twitterId: profile.id,
                    username: profile.username                    
                }).save().then((newUser) => {                    
                    done(null, newUser);
                });
            }
        });
    })
);
