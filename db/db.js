var mongoose = require('mongoose');
var config = require('../profile.json');
mongoose.Promise = global.Promise;  
mongoose.connect(config.db_conection);

mongoose.connection.on('connected', function () {    
    console.log('Mongoose connection open to ' + config.db_conection);  
});    

mongoose.connection.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});    

mongoose.connection.on('disconnected', function () {    
    console.log('Mongoose connection disconnected');  
});

module.exports = mongoose;