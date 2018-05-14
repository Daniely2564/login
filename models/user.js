const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');


const userSchema = new Schema({
    username:{
        type:String,
        index:true
    },
    password:String,
    email:String,
    name:String

});

const User = module.exports = mongoose.model('User',userSchema);

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err,hash){
            // store hash in your passwordDB
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.getUserByUsername = function(username, callback){
    let query = {username:username};
    User.findOne(query, callback); 
}

module.exports.comparePassword = function(candidatePassword,hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if(err) throw err;
        callback(null, isMatch);
    });
};

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};