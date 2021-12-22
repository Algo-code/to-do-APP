const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var BoardSchema = new Schema({
    name: {
        type: String,
        require: true,
        minlength: 3,
        maxLength:30
    }
});

BoardSchema.virtual('url').get(function(){
    return '/task/board/' + this._id;
});

module.exports = mongoose.model('board', BoardSchema);
