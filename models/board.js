const mongoose = require("mongoose");
const {DateTime} = require('luxon')

const Schema = mongoose.Schema;

var TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    dueDate:{
        type: Date,
        default: Date.now(),
        required: true,
    },
    status:{
        type: String,
        default: "new"
    },
    timeStamp:{
        type: Date,
        default: Date.now()
    },
});

TaskSchema.virtual('day').get(function(){
    return this.dueDate.getDate();
})

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

  TaskSchema.virtual('expired').get(function(){
    const today = Date.now();
    const diffTime = this.dueDate - today;
    const diffDays = Math.ceil(diffTime/(1000 * 60 * 60 * 24));

    if(diffDays < 0 && this.status != 'complete'){
        return true;
    }
    else
        return false;
  })

  TaskSchema.virtual('timePeriod').get(function(){
    var due_date = DateTime.fromJSDate(this.dueDate).toLocaleString(DateTime.DATE_SHORT);
    const today = Date.now();
    const diffTime = today - this.dueDate;
    const diffDays = Math.ceil(diffTime/(1000 * 60 * 60 * 24));
    
    if(diffDays < 1 ){
        return 'current';
    }
    else if(diffDays > 0 && diffDays < 7 ){
        return 'days';
    }
    else if(diffDays > 6 && diffDays < 15){
        return 'week';
    }
    else if(diffDays > 14 && diffDays < 30){
        return 'month';
    }
    else if(diffDays > 29 && diffDays < 90){
        return 'quarter';
    }
    
    else{
        return 'older';
    }
  })


var BoardSchema = new Schema({
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
    tasks: [TaskSchema]
});

BoardSchema.virtual('url').get(function(){
    return '/board/' + this._id;
});

BoardSchema.virtual('task_count').get(function(){
    return this.tasks.length;
});


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