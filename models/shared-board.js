const mongoose = require("mongoose");
const {DateTime} = require('luxon');

const Schema = mongoose.Schema;

var TaskSchema = new Schema ({
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
    }
});

TaskSchema.virtual('weekday').get(function() {
    var due_date = DateTime.fromJSDate(this.dueDate).toLocaleString(DateTime.DATE_SHORT);
    const today = Date.now();
    const diffTime = this.dueDate - today;
    const diffDays = Math.ceil(diffTime/(1000 * 60 * 60 * 24));
  
    if(diffDays > 5 || diffDays < -1){
        return due_date
    }
    else if(diffDays == 0){
        return 'Today';
    }
    else if(diffDays == 1){
        return 'Tomorrow';
    }
    else if(diffDays == -1){
        return 'Yesterday';
    }
    else{
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return weekday[this.dueDate.getDay()];
    }
  });


var SharedBoardSchema = new Schema({
    name: {
        type: String,
        require: true,
        minlength: 3,
        maxLength:30
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },
    tasks: [TaskSchema],
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
    return '/board/' + this._id;
});

SharedBoardSchema.virtual('task_count').get(function(){
    return this.tasks.length;
})

SharedBoardSchema.virtual('collab_count').get(function(){
    return this.collaborators.length;
})


module.exports = mongoose.model('SharedBoard', SharedBoardSchema);
