let mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/201701node');

let MessageSchema = new mongoose.Schema({
    username: String,
    content:String,
    createAt:{type:Date,default:Date.now}
});

let Message = mongoose.model('Message',MessageSchema);
exports.Message = Message;