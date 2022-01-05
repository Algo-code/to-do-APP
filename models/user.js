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
        ref:'MyBoard'
    }],
    sharedBoards:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SharedBoard'
    }]
});

module.exports = mongoose.model("User", UserSchema);