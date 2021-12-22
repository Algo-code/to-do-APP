const mongoose =require("mongoose");
const { DateTime } = require('luxon');

function getDayOfWeek(date) {
    const dayOfWeek = new Date(date).getDay();    
    return isNaN(dayOfWeek) ? null : 
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
  }

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




TaskSchema.virtual('weekday').get(function(){
    var dueDate = DateTime.fromJSDate(this.due_date).toLocaleString(DateTime.DATE_SHORT);
    const today = Date.now();
    const diffTime = Math.abs(this.due_date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if(diffDays>7){
        return dueDate;
    } else{
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        return weekday[this.due_date.getDay()];
        //getDayOfWeek(dueDate);
    }  
})

TaskSchema.virtual('day').get(function(){
    return this.due_date.getDate();
})


module.exports = mongoose.model('task', TaskSchema);