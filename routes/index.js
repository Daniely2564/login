const router = require('express').Router();
const User = require('../models/user');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.get('/', ensureAuthenticated, function(req,res){
    res.render('index/index');
});

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
}

//Register
router.route('/register')
    .get(function(req,res){
    res.render('index/register');
    })
    .post(function(req,res){
        const name = req.body.name;
        const email= req.body.email;
        const password = req.body.password;
        const password2 = req.body.password2;

        console.log(name);
        req.checkBody('name','Name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password2','Passwords do not match').equals(req.body.password);

        const errors = req.validationErrors();

        if(errors){
            res.render('index/register',{
                errors:errors
            });
        }else{
            let newUser = new User();
            newUser.username = req.body.username;
            newUser.name = req.body.name;
            newUser.email = req.body.email;
            newUser.password = req.body.password;

            User.createUser(newUser, function(err, user){
                if(err) return err;
                console.log(user);
            });
            
            req.flash('success_msg','You are registered and can now log in');
            res.redirect('/register');
        }
    })
;

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.getUserByUsername(username, function(err,user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message: `Unknown user.`});
        }

        User.comparePassword(password,user.password, function(err,isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null, user);
            } else {
                return done(null, false, {message: `Invalid Password`});
            }
        })
      })
    }
  ));

passport.serializeUser(function(user,done){
    done(null, user.id);
});

passport.deserializeUser(function(id,done){
    User.getUserById(id,function(err, user){
        done(err, user);
    });
});


router.route('/login')
    .get(function(req,res){
    res.render('index/login');
    })
    .post(passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/login',
        failureFlash: true
    }),
    function(req,res){
        res.redirect('/');
    });

router.get('/logout',function(req,res){
    req.logout();
    req.flash('success_msg','You are logged out!');
    res.redirect('/login');
});

module.exports = router;