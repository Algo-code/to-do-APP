const Task = require("../models/todo");
const { DateTime } = require('luxon');

const async = require("async");
const {body, validationResult} = require("express-validator");
const Board = require("../models/board");
const mongoose = require("mongoose");
const { getMaxListeners } = require("../models/todo");

const date = new Date(Date.now());
const currentDate = DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_SHORT);

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
            if(req.body.board == '' || req.body.board === ""){
                req.body.board = 'random';
            }
            //console.log(req.body.board);
            Board.findOne({
                name: req.body.board.toLowerCase()
            }).exec(function(err, results){
                if(err)
                    return handleError(err);
                if(results !== null){
                    const task = new Task({
                        title: req.body.title,
                        description: req.body.description,
                        due_date: req.body.due_date,
                        board: results._id
                    });
                    task.save(function(err){
                        if(err)
                            return next(err);
                        res.redirect('/');
                    });
                }else{
                    const board = new Board({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body.board.toLowerCase()
                    });

                    board.save(function(err){
                        if(err)
                            return next(err);
                        const task = new Task({
                            title: req.body.title,
                            description: req.body.description,
                            due_date: req.body.due_date,
                            board: board._id
                        });
                        task.save(function(err){
                            if(err)
                                return next(err);
                            res.redirect('/');
                        });
                    })
                }
            })
            //data is valid && create new task object with trimmed and validated data
            
        }
    }
]

//Display create Task
exports.create_task_get = (req, res, next) => {
    const currentDate = new Date(Date.now());
    const today = DateTime.fromJSDate(currentDate).toLocaleString(DateTime.DATE_SHORT);
    res.render('todo/add_task', {title: 'new task', date:today});
}


//Display all Tasks
exports.get_tasks = (req, res, next) => {
    async.parallel({
        tasks: function(callback){
            Task.find({due_date: {$gte: currentDate}})
            .sort({due_date: 1})
            .populate('board')
            .exec(callback)
        },
        boards: function(callback){
            Board.find()
            .sort({name: 1})
            .exec(callback)
        }
    }, function (err, results){
        if(err)
            return next(err);
        res.render('todo/all_tasks', {title: 'All Tasks', results: results, currentDate: currentDate});
    })
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
    console.log(req.params);
    async.parallel({
        AllBoards: function(callback){
            Board.find()
            .sort({name: 1})
            .exec(callback)
        },
        board: function(callback){
            Board.findById(req.params.board)
            .exec(callback)
        },
        tasks: function(callback){
            Task.find({'board':req.params.board, due_date: {$gte: currentDate}})
            .populate('board')
            .exec(callback)
        }
    }, function(err, results){
        if(err)
            return next(err)
        if(results.board === null){
            var err = new Error('Board Not Found');
            err.status = 404;
            return next(err);
        }

        res.render('todo/board_tasks', {title: results.board.name, tasks: results.tasks, boards:results.AllBoards, path: '/board/'+results.board._id})
    })
};

