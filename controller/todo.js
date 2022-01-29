const User = require("../models/user");
const MyBoard = require("../models/board");
const SharedBoard = require("../models/shared-board");

const { DateTime } = require("luxon");
const async = require("async");
const { body, validationResult } = require("express-validator");

const mongoose = require("mongoose");
const { findByIdAndDelete } = require("../models/board");
//const { getMaxListeners, count } = require("../models/todo");

const date = new Date(Date.now());
const currentDate = DateTime.fromJSDate(date).toLocaleString(
  DateTime.DATE_SHORT
);

function getWeekday(dueDate) {
  var due_date = DateTime.fromJSDate(dueDate).toLocaleString(
    DateTime.DATE_SHORT
  );
  const today = Date.now();
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 5 || diffDays < -1) {
    return due_date;
  } else if (diffDays == 0) {
    return "Today";
  } else if (diffDays == 1) {
    return "Tomorrow";
  } else if (diffDays == -1) {
    return "Yesterday";
  } else {
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return weekday[dueDate.getDay()];
  }
}

//create task for myBoard
exports.create_myTask_post = [
  body("title", "Task title can not be empty.")
    .trim()
    .isLength({ min: 1, max: 20 })
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
        board_id: req.params.boardID,
        title: "add task",
        task: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      var board_id = mongoose.Types.ObjectId(req.params.boardID);

      User.findById(req.user._id, (err, result) => {
        if (err) return next(err);
        if (result.myBoards.includes(board_id)) {
          MyBoard.findById(req.params.boardID, function (err, board) {
            if (err) return next(err);
            const task = {
              _id: mongoose.Types.ObjectId(),
              title: req.body.title,
              description: req.body.description,
              dueDate: req.body.due_date,
              status: "new",
              timeStamp: date,
            };
            board.tasks.push(task);
            board.save(function (err) {
              if (err) return next(err);
              res.redirect(board.url);
            });
          });
        } else {
          var err = new Error("Board Not Found");
          err.status = 404;
          return next(err);
        }
      });
    }
  },
];

//create task for sharedBoard
exports.create_sharedTask_post = [
  body("title", "Task title can not be empty.")
    .trim()
    .isLength({ min: 1, max: 20 })
    .escape(),
  body("description", "Use description to add more details")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .escape(),
  body("priority", "set task importance by adding priority")
    .optional({ checkFalsy: true })
    .trim()
    .isNumeric()
    .escape(),
  body("assigned_to", "add user to whom the task is assigned")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .escape(),
  body("due_date", "Invalid date").isISO8601().toDate(),

  //process request after validation and sanitization
  (req, res, next) => {
    //extract validation errors from req
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      res.render("todo/add_shared_task", {
        board_id: boardID,
        title: "add shared task",
        task: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      var board_id = mongoose.Types.ObjectId(req.params.boardID);

      User.findById(req.user._id, (err, result) => {
        if (err) return next(err);
        if (result.sharedBoards.includes(board_id)) {
          SharedBoard.findById(req.params.boardID, function (err, board) {
            if (err) return next(err);

            function assignTask(array) {
              if (Array.isArray(array)) {
                if (array !== null && !array.isEmpty()) {
                  return array;
                } else {
                  return new Array();
                }
              } else {
                return new Array(array);
              }
            }
            const task = {
              _id: mongoose.Types.ObjectId(),
              title: req.body.title,
              description: req.body.description,
              dueDate: req.body.due_date,
              status: "new",
              timeStamp: date,
              priority: req.body.priority,
              createdBy: req.user._id,
              assignedTo: assignTask(req.body.assigned_to),
            };
            board.tasks.push(task);
            board.save(function (err) {
              if (err) return next(err);
              res.redirect(board.url);
            });
          });
        } else {
          var err = new Error("Board Not Found");
          err.status = 404;
          return next(err);
        }
      });
    }
  },
];

//Display create myTask
exports.create_myTask_get = (req, res, next) => {
  res.render("todo/add_task", {
    title: "new task",
    date: currentDate,
    board_id: req.params.boardID,
  });
};

//Display create sharedTask
exports.create_sharedTask_get = (req, res, next) => {
  res.render("todo/add_shared_task", {
    title: "new task",
    date: currentDate,
    board_id: req.params.boardID,
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
      const board = new MyBoard({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name.toLowerCase(),
        createdOn: Date.now(),
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
        //res.redirect(board.url);
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
        createdOn: Date.now(),
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
        //res.redirect(board.url);
      });
    }
  },
];

//Display all Tasks
exports.get_tasks = (req, res, next) => {
  async.parallel(
    {
      boards: function (callback) {
        User.findById(req.user._id)
          .populate({ path: "myBoards", options: { sort: { name: "1" } } })
          .populate({
            path: "sharedBoards",
            options: { sort: { name: "1" } },
          })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      var mtotal = 0;
      var stotal = 0;
      function totalTasks() {
        for (var i = 0; i < results.boards.myBoards.length; i++) {
          mtotal += results.boards.myBoards[i].tasks.length;
        }
        for (var i = 0; i < results.boards.sharedBoards.length; i++) {
          stotal += results.boards.sharedBoards[i].tasks.length;
        }
        //console.log(total);
        return mtotal + stotal;
      }
      res.render("todo/all_tasks", {
        totalTasks: totalTasks(),
        title: "All Tasks",
        results: results,
        currentDate: currentDate,
        path:'/'
      });
    }
  );
};

//Display Task by myBoard category
exports.get_task_board = (req, res, next) => {
  //console.log(req.params.boardID);
  async.parallel(
    {
      boards: function (callback) {
        User.findById(req.user._id)
          .populate({ path: "myBoards", options: { sort: { name: "1" } } })
          .populate({
            path: "sharedBoards",
            options: { sort: { name: "1" } },
          })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      currentBoard = results.boards.myBoards.find(
        (board) => board._id == req.params.boardID
      );
      var boardType = "myBoard";
      if (!currentBoard) {
        currentBoard = results.boards.sharedBoards.find(
          (board) => board._id == req.params.boardID
        );
        var boardType = "sharedBoard";
      }
      if (!currentBoard) {
        var err = new Error("Board Not Found");
        err.status = 404;
        return next(err);
      }
      // count all tasks in all boards
      var mtotal = 0;
      var stotal = 0;
      function totalTasks() {
        for (var i = 0; i < results.boards.myBoards.length; i++) {
          mtotal += results.boards.myBoards[i].tasks.length;
        }
        for (var i = 0; i < results.boards.sharedBoards.length; i++) {
          stotal += results.boards.sharedBoards[i].tasks.length;
        }
        //console.log(total);
        return mtotal + stotal;
      }
      res.render("todo/board_nav", {
        title: currentBoard.name + " Tasks",
        boardType: boardType,
        results: results,
        totalTasks: totalTasks(),
        currentBoard: currentBoard,
        path: "/board"//+currentBoard._id,
      });
    }
  );
};

exports.deleteTask = (req, res, next) => {
  var board_id = mongoose.Types.ObjectId(req.params.boardID);
  var task_id = mongoose.Types.ObjectId(req.params._id);
  var user_id = req.user._id;

  User.findById(user_id, (err, result) => {
    if (err) return next(err);
    if (result.myBoards.includes(board_id)) {
      MyBoard.findOneAndUpdate(
        { _id: board_id },
        { $pull: { tasks: { _id: task_id } } },
        { safe: true, multi: false }
      )
        .then(res.redirect("/board/" + req.params.boardID))
        .catch((err) => console.log(err));
    } else if (result.sharedBoards.includes(board_id)) {
      SharedBoard.findById(board_id, (err, board) => {
        if (err) return next(err);
        if (String(board.owner) === String(mongoose.Types.ObjectId(user_id))) {
          SharedBoard.findOneAndUpdate(
            { _id: board_id },
            { $pull: { tasks: { _id: task_id } } },
            { safe: true, multi: false }
          )
            .then(res.redirect("/board/" + req.params.boardID))
            .catch((err) => console.log(err));
        } else {
          var err = new Error("Not Owner Of Board");
          err.status = 403;
          return next(err);
        }
      });
    } else {
      var err = new Error("Board Not Found");
      err.status = 404;
      return next(err);
    }
  });
};

exports.edit_myTask_get = (req, res, next) => {
  var board_id = mongoose.Types.ObjectId(req.params.boardID);
  var task_id = mongoose.Types.ObjectId(req.params._id);
  var user_id = req.user._id;

  User.findById(user_id, (err, result) => {
    if (err) return next(err);
    if (result.myBoards.includes(board_id)) {
      MyBoard.findOne(
        { _id: board_id },
        {
          tasks: {
            $elemMatch: { _id: { $eq: task_id } },
          } /*joined: 1, lastLogin: 1 */,
        }
      ).exec(function (err, task) {
        if (err) return next(err);
        //console.log(task.tasks[0]);
        var boardType = "myBoard";
        var date = DateTime.fromJSDate(task.tasks[0].dueDate).toLocaleString(
          DateTime.DATE_SHORT
        );
        var des = task.tasks[0].description;
        console.log(des);
        res.render("todo/update_task", {
          title: "task update",
          description: des,
          date: date,
          task: task.tasks[0],
          boardType: boardType,
          board_id: board_id,
          _id: task_id,
        });
      });
    } else if (result.sharedBoards.includes(board_id)) {
      SharedBoard.findOne(
        { _id: board_id },
        {
          tasks: {
            $elemMatch: { _id: { $eq: task_id } },
          } /*joined: 1, lastLogin: 1 */,
        }
      ).exec(function (err, task) {
        if (err) return next(err);
        //console.log(task.tasks[0]);
        var boardType = "sharedBoard";
        var date = DateTime.fromJSDate(task.tasks[0].dueDate).toLocaleString(
          DateTime.DATE_SHORT
        );
        var des = task.tasks[0].description;
        console.log(des);
        res.render("todo/update_task", {
          title: "task update",
          description: des,
          date: date,
          task: task.tasks[0],
          boardType: boardType,
          board_id: board_id,
          _id: task_id,
        });
      });
    } else {
      var err = new Error("Board Not Found");
      err.status = 404;
      return next(err);
    }
  });
};

exports.edit_myTask_post = [
  body("title", "Task title can not be empty.")
    .trim()
    .isLength({ min: 1, max: 20 })
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
    var board_id = mongoose.Types.ObjectId(req.params.boardID);
    var task_id = mongoose.Types.ObjectId(req.params._id);
    var user_id = req.user._id;

    User.findById(user_id, (err, result) => {
      if (err) return next(err);
      if (result.myBoards.includes(board_id)) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          res.render("todo/update_task", {
            board_id: req.params.boardID,
            title: "update task",
            task: req.body,
            errors: errors.array(),
          });
          return;
        } else {
          MyBoard.updateOne(
            { _id: board_id, "tasks._id": task_id },
            {
              $set: {
                "tasks.$.title": req.body.title,
                "tasks.$.description": req.body.description,
                "tasks.$.dueDate": req.body.due_date,
                "tasks.$.status": "new",
              },
            },
            function (err) {
              if (err) return next(err);
              return res.redirect("/board/" + board_id);
            }
          );
        }
      } else if (result.sharedBoards.includes(board_id)) {
        return next();
      } else {
        var err = new Error("Unauthorized Action");
        err.status = 403;
        return next(err);
      }
    });
  },
];

exports.edit_sharedTask_post = [
  body("title", "Task title can not be empty.")
    .trim()
    .isLength({ min: 1, max: 20 })
    .escape(),
  body("description", "Use description to add more details")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .escape(),
  body("priority", "set task importance by adding priority")
    .optional({ checkFalsy: true })
    .trim()
    .isNumeric()
    .escape(),
  body("assigned_to", "add user to whom the task is assigned")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .escape(),
  body("due_date", "Invalid date").isISO8601().toDate(),

  //process request after validation and sanitization
  (req, res, next) => {
    //extract validation errors from req
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("todo/update_task", {
        board_id: req.params.boardID,
        title: "update task",
        task: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      var board_id = mongoose.Types.ObjectId(req.params.boardID);
      var task_id = mongoose.Types.ObjectId(req.params._id);
      var user_id = req.user._id;

      User.findById(user_id, (err, result) => {
        if (err) return next(err);
        if (result.sharedBoards.includes(board_id)) {
          function assignTask(array) {
            if (Array.isArray(array)) {
              if (array !== null && !array.isEmpty()) {
                return array;
              } else {
                return new Array();
              }
            } else {
              return new Array(array);
            }
          }
          SharedBoard.updateOne(
            { _id: board_id, "tasks._id": task_id },
            {
              $set: {
                "tasks.$.title": req.body.title,
                "tasks.$.description": req.body.description,
                "tasks.$.dueDate": req.body.due_date,
                "tasks.$.status": "new",
                "tasks.$.priority": req.body.priority,
                "tasks.$.assignedTo": assignTask(req.body.assigned_to),
              },
            },
            function (err) {
              if (err) return next(err);
              return res.redirect("/board/" + board_id);
            }
          );
        } else {
          var err = new Error("Unauthorized Action");
          err.status = 403;
          return next(err);
        }
      });
    }
  },
];

//POST controller to change task status
exports.task_status = (req, res, next) => {
  var board_id = mongoose.Types.ObjectId(req.params.boardID);
  var task_id = mongoose.Types.ObjectId(req.params._id);
  var user_id = req.user._id;

  User.findById(user_id, (err, result) => {
    if (err) return next(err);
    if (result.myBoards.includes(board_id)) {
      MyBoard.updateOne(
        { _id: board_id, "tasks._id": task_id },
        { $set: { "tasks.$.status": "complete" } },
        function (err) {
          if (err) return next(err);
          return res.redirect(req.get("referer"));
        }
      );
    } else if (result.sharedBoards.includes(board_id)) {
      SharedBoard.updateOne(
        { _id: board_id, "tasks._id": task_id },
        { $set: { "tasks.$.status": "complete" } },
        function (err) {
          if (err) return next(err);
          return;// res.redirect(req.get("referer"));
        }
      );
    } else {
      var err = new Error("Unauthorized Action");
      err.status = 403;
      return next(err);
    }
  });
};

//POST controller for deleting a board
exports.deleteBoard_post = (req, res, next) => {
  var user_id = req.user
  var board_id = req.params.boardID;

  User.findById(user_id, (err, result)=>{
    if(result.myBoards.includes(board_id)){
      MyBoard.findByIdAndDelete(board_id, function(err, board){
        if(err)
          return next(err);
        return res.redirect('/');
      });
    }
    else if(result.sharedBoards.includes(board_id)){
      SharedBoard.findByIdAndDelete(board_id, function(err, board){
        if(err)
          return next(err);
        return res.redirect('/');
      })
    }
    else{
      var err = new Error("Board Not Found");
      err.status = 404;
      return next(err); 
    }
  })
}

//Display about page

exports.getAbout = (req, res, next) => {
  res.render('about', {title: 'about', path: '/about'});
}
