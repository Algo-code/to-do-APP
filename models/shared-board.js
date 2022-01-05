const mongoose = require("mongoose");

const Schema = mongoose.Schema;


var SharedBoardSchema = new Schema({
    name: {
        type: String,
        require: true,
        minlength: 3,
        maxLength:30
    },
    tasks: [{
        title: {
            type: String,
            required: true
        },
        description:{
            type: String,
        },
        dueDate:{
            type: Date,
            default: Date.now()
        },
        status:{
            type: String,
            default: "new"
        },
        timeStamp:{
            type: Date,
            default: Date.now()
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedTo: [{
            type: String,
            default: 'Everyone'
        }],
        priority: {
            type: Number,
            default: 1
        },
        day: {
            type: String,
        },
        weekday: {
            type: String,
        }
    }],
    // shared:{
    //     type:Boolean,
    //     default: false
    // },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

SharedBoardSchema.virtual('url').get(function(){
    return '/shared_board/' + this._id;
});

SharedBoardSchema.virtual('task_count').get(function(){
    return this.tasks.length;
})

SharedBoardSchema.virtual('collab_count').get(function(){
    return this.collaborators.length;
})


module.exports = mongoose.model('SharedBoard', SharedBoardSchema);
