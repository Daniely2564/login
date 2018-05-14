const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const validator = require('express-validator');

const config = require('./Config/config');
mongoose.connect(config.config).then(()=>{
    console.log(`Successfully connected to mongodb`);
}).catch(err=>{
    return console.log(err);
})

// Routes
const indexRoute = require('./routes/index');

// Initialize App.
const app = express();

//view engine
app.engine('hbs',hbs({
    extname:'hbs',
    defaultLayout:'layout',
    layoutsDir: __dirname+'/views/layouts',
    partialsDir: __dirname+'/views/layouts'
}));
app.set('view engine', 'hbs');

//Middleware.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

//Set static folder 
app.use(express.static(path.join(__dirname,'public')));
app.set('/css', path.join(__dirname,'public','css'));

// Express session
app.use(session({
    secret:'secret',
    saveUninitialized: true,
    resave: true
}));

// Using Passport.
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(validator({
    errorFormatter:function(param,message,value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + `]`;
        }

        return {
            param : formParam,
            message : message,
            value : value
        }
    }
}));

// Connect flash
app.use(flash());

// Setting global messages..
app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/',indexRoute);

app.set('port',(process.env.PORT || 3000));
app.listen(app.get('port'),function(){
    console.log(`The server has started..`);
})