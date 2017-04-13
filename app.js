const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const credentials = require('./credentials.js');

// var mongoose = require("mongoose");
// var config = require('./profile.json');
// mongoose.connect(config.db_conection);

// var SessionStore = require("session-mongoose")(express);
// var store = new SessionStore({
//     interval: 20000, // expiration check worker run interval in millisec (default: 60000)
//     connection: mongoose.connection // <== custom connection
// });

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
var handlebars = require('express3-handlebars')
    .create({
        defaultLayout: 'main',
        helpers: {
            section:  (name, options) =>{
                if (!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session(
    {
        secret: credentials.cookieSecret,
        cookie: {
            maxAge: 1000*60*60
        }
    }
));

app.use('/',index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use( (req, res, next) =>{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use( (err, req, res, next) =>{
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log(err);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
