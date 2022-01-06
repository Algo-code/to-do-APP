const express = require('express');

const router = express.Router();

const todo_controller = require('../controller/todo');
const isAuth = require('../middleware/is-auth');


/**
 * Routes
*/

router.get('/',isAuth, todo_controller.get_tasks);

router.get('/my_board/create', isAuth, todo_controller.create_myBoard_get);
router.post('/my_board/create', isAuth, todo_controller.create_myBoard_post);

router.get('/shared_board/create', isAuth, todo_controller.create_sharedBoard_get);
router.post('/shared_board/create', isAuth, todo_controller.create_sharedBoard_post);

router.get('/my_board/:boardID', isAuth, todo_controller.get_task_board)
//router.get('/my_board/:boardID', isAuth, todo_controller)

router.get('/my_board/:boardID/task/create', isAuth, todo_controller.create_myTask_get);
router.post('/my_board/:boardID/task/create', isAuth, todo_controller.create_myTask_post);

router.get('/shared_board/:boardID/task/create', isAuth, todo_controller.create_sharedTask_get);
router.post('/shared_board/:boardID/task/create', isAuth, todo_controller.create_sharedTask_post);

//router.get('/all',isAuth,  todo_controller.get_tasks);
// router.get('/board/create',isAuth, todo_controller.create_myBoard_get);
// router.post('/board/create',isAuth, todo_controller.create_myBoard_post);


// router.get('/board/:board', isAuth, todo_controller.get_task_board);
// router.get('/board/:board/task/create', isAuth, todo_controller.create_task_get);
// router.post('/board/:board/task/create', isAuth, todo_controller.create_task_post);


// router.get('/:id', isAuth, todo_controller.get_task);


module.exports = router;