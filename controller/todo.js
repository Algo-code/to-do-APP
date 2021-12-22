const Task = require("../models/todo");
const { DateTime } = require('luxon');

const async = require("async");
const {body, validationResult} = require("express-validator");


//create task
exports.create_task_post = [
    body('title', 'Task title can not be empty.').trim().isLength({min:1, max:15}).escape(),
    body('description', 'Use description to add more details').optional({checkFalsy: true}).trim().isLength({max:150}).escape(),
    body('due_date', 'Invalid date').isISO8601().toDate(),
    body('board', 'Task Category').optional({checkFalsy:true}).trim().escape(),

    //process request after validation and sanitization
    (req, res, next) => {
        //extract validation errors from req
        const errors = validationResult(req);

        if(!errors.isEmpty){
            res.render('todo/add_task',{title: 'add task', task: req.body, errors: errors.array()});
            return;
        }
        else{
            //data is valid && create new task object with trimmed and validated data
            var task = new Task({
                title: req.body.title,
                description: req.body.description,
                due_date: req.body.due_date,
                board: undefined
            });
            task.save(function(err){
                if(err)
                    return next(err);
                res.redirect(task.url);
            });
        }
    }
]

//Display create Task
exports.create_task_get = (req, res, next) => {
    res.render('todo/add_task', {title: 'new task'});
}


//Display all Tasks
exports.get_tasks = (req, res, next) => {
    const date = new Date(Date.now());
    const currentDate = DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
    Task.find()
    .sort({due_date: 1})
    .exec((err, task_list) =>{
        if(err)
            return next(err);
        res.render('todo/all_tasks', {title: 'All Tasks', tasks: task_list, currentDate: currentDate});
    });
};

//Display single Task
exports.get_task = (req, res, next)  => {
    async.parallel({
        task: function(callback){
            Task.findById(req.param.id).exec(callback)
        }
    }, function(err, results){
        if(err)
            return next(err);
        if(results.task == null){
            var err = new Error('Task Not Found');
            err.status = 404;
            return next(err);
        }

        res.render('task_details', {title: results.task.title, task: results.task});
    });
};

//Display Task by Board category
exports.get_task_board = (req, res, next) => {
    async.parallel({
        board_tasks: function(callback){
            Task.find({'board': req.params.board}).exec(callback)
        }
    }, function(err, results){
        if(err){
            return next(err);
        }
        if(results.board_tasks == null){
            var err = new Error('No Tasks Found');
            err.status = 404;
            return next(err);
        }

        res.render('board_tasks', {title: 'board tasks', tasks: results.board_tasks});
    });
};

