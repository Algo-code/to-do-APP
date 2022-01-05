const mongoose = require("mongoose");

const UserSchema =  mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    myBoards: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'Board'
    }],
    sharedBoards:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shared Board'
    }]
});

module.exports = mongoose.model("user", UserSchema);