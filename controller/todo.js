const User = require("../models/user");
const MyBoard = require("../models/board");
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

function getDay (dueDate) {
  return dueDate.getDate();
};

function getWeekday (dueDate) {
  var due_date = DateTime.fromJSDate(dueDate).toLocaleString(DateTime.DATE_SHORT);
  const today = Date.now();
  const diffTime = dueDate - today;
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
      return weekday[dueDate.getDay()];
  }
}

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
        board_id: req.params.boardID,
        title: "add task",
        task: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      //console.log(req.body.board);
        MyBoard.findById(req.params.boardID, function (err, board) {
          if (err) return next(err);
          const task = {
            _id: mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.due_date,
            status: "new",
            timeStamp: date,
            day: getDay(req.body.due_date),
            weekday: getWeekday(req.body.due_date),
          };
          board.tasks.push(task);
          board.save(function (err) {
            if (err) return next(err);
            res.redirect(board.url);
          });
        });
        //res.redirect('/');
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
        SharedBoard.findById(req.params.boardID, function (err, board) {
          if (err) return next(err);
          const task = {
            _id: mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.due_date,
            status: "new",
            timeStamp: date,
            priority: req.body.priority,
            createdBy: req.user._id,
            assignedTo: new Array(),
            day: getDay(req.body.due_date),
            weekday: getWeek(req.body.due_date),
          };
          board.tasks.push(task);
          board.save(function (err) {
            if (err) return next(err);
            res.redirect(board.url);
          });
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
    board_id: req.params.boardID,
  });
};


//Display create sharedTask
exports.create_sharedTask_get = (req, res, next) => {
    console.log("get task: " + req.params._id + " " + req.params.board);
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
      console.log(results.boards.myBoards);
      res.render("todo/all_tasks", {
        title: "All Tasks",
        results: results,
        currentDate: currentDate,
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
      currentBoard: function (callback) {
        MyBoard.findById(req.params.boardID)
        .exec(callback)
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
        title: results.currentBoard.name + ' Tasks',
        results: results,
        path: "/my_board/" /*+results.board_tasks._id*/,
      });
    }
  );
};



// //Display Task by shared_Board category
// exports.get_task_board = (req, res, next) => {
//   async.parallel(
//     {
//       boards: function (callback) {
//         User.findById(req.user._id)
//           .populate({
//             path: "sharedBoards",
//             options: { sort: { name: "1" } },
//           })
//           .exec(callback);
//       },
//     },
//     function (err, results) {
//       if (err) return next(err);
//       if (results.myBoards === null || results.sharedBoards === null) {
//         var err = new Error("Board Not Found");
//         err.status = 404;
//         return next(err);
//       }
//       res.render("todo/shared_board_tasks", {
//         results: results,
//         path: "/share_board/" /*+results.board_tasks._id*/,
//       });
//     }
//   );
// };




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
