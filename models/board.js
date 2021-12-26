const mongoose = require("mongoose");
const async = require("async");

const Schema = mongoose.Schema;
const Task = require('../models/todo');

var BoardSchema = new Schema({
    name: {
        type: String,
        require: true,
        minlength: 3,
        maxLength:30
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'Task'
    }]
});

BoardSchema.virtual('url').get(function(){
    return '/board/' + this._id;
});

BoardSchema.virtual('count').get(function(){
    return this.tasks.length;
})

module.exports = mongoose.model('Board', BoardSchema);
