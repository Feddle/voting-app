const router = require("express").Router();
const passport = require("passport");


// auth logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});


router.get("/twitter", passport.authenticate("twitter"));


router.get("/twitter/redirect", passport.authenticate("twitter"), (req, res) => {    
    res.redirect('/');
});

module.exports = router;
