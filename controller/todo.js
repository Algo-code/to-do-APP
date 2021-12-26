const Task = require("../models/todo");
const { DateTime } = require('luxon');

const async = require("async");
const {body, validationResult} = require("express-validator");
const Board = require("../models/board");
const mongoose = require("mongoose");
const { getMaxListeners, count } = require("../models/todo");

const date = new Date(Date.now());
const currentDate = DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_SHORT);

//create task
exports.create_task_post = [
    body('title', 'Task title can not be empty.').trim().isLength({min:1, max:15}).escape(),
    body('description', 'Use description to add more details').optional({checkFalsy: true}).trim().isLength({max:150}).escape(),
    body('due_date', 'Invalid date').isISO8601().toDate(),

    //process request after validation and sanitization
    (req, res, next) => {
        //extract validation errors from req
        const errors = validationResult(req);

        if(!errors.isEmpty){
            res.render('todo/add_task',{title: 'add task', task: req.body, errors: errors.array()});
            return;
        }
        else{
            //console.log(req.body.board);
            const task  = Task({
                _id: mongoose.Types.ObjectId(),
                title: req.body.title,
                description: req.body.description,
                due_date: req.body.due_date,
                status: 'new'
            });
            task.save(function(err){
                if(err)
                    return next(err);
                Board.findById(req.params.board, function(err, board){
                    if(err)
                        return next(err);
                    board.tasks.push(task._id);
                    board.save(function(err){
                        if(err)
                            return next(err);
                        res.redirect(board.url);
                    })
                });
                //res.redirect('/');
            });
        }
    }
]

//Display create Task
exports.create_task_get = (req, res, next) => {
    console.log('get task: '+req.params._id+' '+ req.params.board);
    res.render('todo/add_task', {title: 'new task', date:currentDate, board_id: req.params.board});
}

//display create Board
exports.create_board_get = (req, res, next) => {
    res.render('todo/add_board', {title: 'Add Board'});
}

// Create Board Post controller
exports.create_board_post = [
    body('name', 'board name can not be empty.').trim().isLength({min:1, max:15}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty){
            res.render('todo/add_board',{title: 'Add Board', board: req.body, errors: errors.array()});
            return;
        }
        else{
            const board = new Board({
                name: req.body.name.toLowerCase(),
                tasks: new Array(),
            });
            board.save(function(err){
                if(err)
                    return next(err);
                res.redirect('/')
            })
        }
    }
]

//Display all Tasks
exports.get_tasks = (req, res, next) => {
    async.parallel({
        task_boards: function(callback){
            Board.find()
            .populate({path: 'tasks', options: { sort: {'due_date': '1'} }})
            .sort({name: 1})
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
    async.parallel({
        boards: function(callback){
            Board.find()
            .sort({name: 1})
            .exec(callback)
        },
        board_tasks: function(callback){
            Board.findById(req.params.board)
            .populate({path: 'tasks', options: { sort: {'due_date': '1'} }})
            .sort({name: 1})
            .exec(callback)
        },
    }, function(err, results){
        if(err)
            return next(err)
        if(results.board_tasks === null){
            var err = new Error('Board Not Found');
            err.status = 404;
            return next(err);
        }
        res.render('todo/board_tasks', {title: results.board_tasks.name,  current_board: results.board_tasks, tasks: results.board_tasks.tasks, boards:results.boards, path: '/board/'+results.board_tasks._id})
    })
};

