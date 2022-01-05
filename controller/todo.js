const User = require("../models/user");
const Board = require("../models/board");
const SharedBoard = require("../models/shared-board");

const { DateTime } = require("luxon");
const async = require("async");
const { body, validationResult } = require("express-validator");

const mongoose = require("mongoose");
//const { getMaxListeners, count } = require("../models/todo");

const date = new Date(Date.now());
const currentDate = DateTime.fromJSDate(date).toLocaleString(
  DateTime.DATE_SHORT
);

//create task for myBoard
exports.create_myTask_post = [
  body("title", "Task title can not be empty.")
    .trim()
    .isLength({ min: 1, max: 15 })
    .escape(),
  body("description", "Use description to add more details")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .escape(),
  body("due_date", "Invalid date").isISO8601().toDate(),

  //process request after validation and sanitization
  (req, res, next) => {
    //extract validation errors from req
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("todo/add_task", {
        title: "add task",
        task: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      //console.log(req.body.board);
      const task = Task({
        _id: mongoose.Types.ObjectId(),
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.due_date,
        status: "new",
        timeStamp: date,
      });
      task.save(function (err) {
        if (err) return next(err);
        Board.findById(req.params.board, function (err, board) {
          if (err) return next(err);
          board.tasks.push(task);
          board.save(function (err) {
            if (err) return next(err);
            res.redirect(board.url);
          });
        });
        //res.redirect('/');
      });
    }
  },
];

//create task for sharedBoard
exports.create_sharedTask_post = [
  body("title", "Task title can not be empty.")
    .trim()
    .isLength({ min: 1, max: 15 })
    .escape(),
  body("description", "Use description to add more details")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .escape(),
  body("due_date", "Invalid date").isISO8601().toDate(),

  //process request after validation and sanitization
  (req, res, next) => {
    //extract validation errors from req
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      res.render("todo/add_shared_task", {
        title: "add task",
        task: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      //console.log(req.body.board);
      const task = Task({
        _id: mongoose.Types.ObjectId(),
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.due_date,
        status: "new",
        timeStamp: date,
        priority: req.body.priority,
        createdBy: req.user._id,
        assignedTo: new Array(),
      });
      task.save(function (err) {
        if (err) return next(err);
        SharedBoard.findById(req.params.board, function (err, board) {
          if (err) return next(err);
          board.tasks.push(task);
          board.save(function (err) {
            if (err) return next(err);
            res.redirect(board.url);
          });
        });
        //res.redirect('/');
      });
    }
  },
];

//Display create myTask
exports.create_myTask_get = (req, res, next) => {
  console.log("get task: " + req.params._id + " " + req.params.board);
  res.render("todo/add_task", {
    title: "new task",
    date: currentDate,
    board_id: req.params.board,
  });
};


//Display create sharedTask
exports.create_sharedTask_get = (req, res, next) => {
    console.log("get task: " + req.params._id + " " + req.params.board);
    res.render("todo/add_shared_task", {
      title: "new task",
      date: currentDate,
      board_id: req.params.board,
    });
  };


//display create myBoard
exports.create_myBoard_get = (req, res, next) => {
  res.render("todo/add_board", { title: "Add Board" });
};

//display create sharedBoard
exports.create_sharedBoard_get = (req, res, next) => {
    res.render("todo/add_shared_board", { title: "Add Board" });
};

// Create myBoard Post controller
exports.create_myBoard_post = [
  body("name", "board name can not be empty.")
    .trim()
    .isLength({ min: 1, max: 15 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      res.render("todo/add_board", {
        title: "Add Board",
        board: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      const board = new Board({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name.toLowerCase(),
        tasks: new Array(),
      });
      board.save(function (err) {
        if (err) return next(err);
        User.findById(req.user._id, function (err, result) {
          if (err) return next(err);
          result.myBoards.push(board._id);
          result.save(function (err) {
            if (err) return next(err);
            res.redirect(board.url);
          });
        });
        res.redirect(board.url);
      });
    }
  },
];

// Create sharedBoard Post controller
exports.create_sharedBoard_post = [
  body("name", "board name can not be empty.")
    .trim()
    .isLength({ min: 1, max: 15 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      res.render("todo/add_shared_board", {
        title: "Add Board",
        board: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      const board = new SharedBoard({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name.toLowerCase(),
        owner: req.user._id,
        collaborators: new Array(),
        tasks: new Array(),
      });
      board.save(function (err) {
        if (err) return next(err);
        User.findById(req.user._id, function (err, result) {
          if (err) return next(err);
          result.sharedBoards.push(board._id);
          result.save(function (err) {
            if (err) return next(err);
            res.redirect(board.url);
          });
        });
        res.redirect(board.url);
      });
    }
  },
];

//Display all Tasks
exports.get_tasks = (req, res, next) => {
  async.parallel(
    {
      myBoards: function (callback) {
        User.findById(req.user._id)
          .populate({ path: "myBoards", options: { sort: { name: "1" } } })
          .exec(callback);
      },
      sharedBoards: function (callback) {
        User.findById(req.user._id)
          .populate({
            path: "sharedBoards",
            options: { sort: { name: "1" } },
          })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render("todo/all_tasks", {
        title: "All Tasks",
        results: results,
        currentDate: currentDate,
      });
    }
  );
};

//Display Task by Board category
exports.get_task_board = (req, res, next) => {
  async.parallel(
    {
      myBoards: function (callback) {
        User.findById(req.user._id)
          .populate({ path: "myBoards", options: { sort: { name: "1" } } })
          .exec(callback);
      },
      sharedBoards: function (callback) {
        User.findById(req.user._id)
          .populate({
            path: "sharedBoards",
            options: { sort: { name: "1" } },
          })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.myBoards === null || results.sharedBoards === null) {
        var err = new Error("Board Not Found");
        err.status = 404;
        return next(err);
      }
      res.render("todo/board_tasks", {
        results: results,
        path: "/board/" /*+results.board_tasks._id*/,
      });
    }
  );
};

//Display single Task
exports.get_task = (req, res, next) => {
  async.parallel(
    {
      task: function (callback) {
        Task.findById(req.param.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.task == null) {
        var err = new Error("Task Not Found");
        err.status = 404;
        return next(err);
      }

      res.render("task_details", {
        title: results.task.title,
        task: results.task,
      });
    }
  );
};
