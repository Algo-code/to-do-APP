const mongoose =require("mongoose");

const TaskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    due_date:{
        type: Date,
        default: Date.now()
    },
    board: {
        type: String,
        default: "random"
    }
});

TaskSchema
.virtual('url')
.get(function (){
    return '/task/'+ this._id;
});

module.exports = mongoose.model('task', TaskSchema);