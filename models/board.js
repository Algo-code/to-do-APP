const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var BoardSchema = new Schema({
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
    }],
});

BoardSchema.virtual('url').get(function(){
    return '/my_board/' + this._id;
});

BoardSchema.virtual('task_count').get(function(){
    return this.tasks.length;
})


module.exports = mongoose.model('MyBoard', BoardSchema);















// const mongoose =require("mongoose");
// const { DateTime } = require('luxon');

// const TaskSchema = mongoose.Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     description:{
//         type: String,
//     },
//     due_date:{
//         type: Date,
//         default: Date.now()
//     },
//     status:{
//         type: String,
//         default: "new"
//     }
// });

// TaskSchema
// .virtual('url')
// .get(function (){
//     return '/task/'+ this._id;
// });




// TaskSchema.virtual('weekday').get(function(){
//     var dueDate = DateTime.fromJSDate(this.due_date).toLocaleString(DateTime.DATE_SHORT);
//     const today = Date.now();
//     const diffTime = this.due_date - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

//     if(diffDays>7){
//         return dueDate;
//     } else if(diffDays == 0){
//         return 'Today'
//     }else if(diffDays == 1){
//         return "Tomorrow"
//     }else{
//         const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
//         return weekday[this.due_date.getDay()];
//         //getDayOfWeek(dueDate);
//     }  
// })

// TaskSchema.virtual('day').get(function(){
//     return this.due_date.getDate();
// })


// module.exports = mongoose.model('Task', TaskSchema);