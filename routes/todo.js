const express = require('express');

const router = express.Router();

const todo_controller = require('../controller/todo');
const isAuth = require('../middleware/is-auth');


/**
 * Routes
*/

router.get('/',isAuth, todo_controller.get_tasks);



//router.get('/all',isAuth,  todo_controller.get_tasks);
router.get('/board/create',isAuth, todo_controller.create_board_get);
router.post('/board/create',isAuth, todo_controller.create_board_post);


router.get('/board/:board', isAuth, todo_controller.get_task_board);
router.get('/board/:board/task/create', isAuth, todo_controller.create_task_get);
router.post('/board/:board/task/create', isAuth, todo_controller.create_task_post);


router.get('/:id', isAuth, todo_controller.get_task);


module.exports = router;