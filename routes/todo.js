const express = require('express');

const router = express.Router();

const todo_controller = require('../controller/todo');


/**
 * Routes
*/

router.get('/', todo_controller.get_tasks);



router.get('/all', todo_controller.get_tasks);
router.get('/create',todo_controller.create_board_get);
router.post('/create', todo_controller.create_board_post);


router.get('/:board', todo_controller.get_task_board);
router.get('/:board/task/create', todo_controller.create_task_get);
router.post('/:board/task/create', todo_controller.create_task_post);


router.get('/:id', todo_controller.get_task);


module.exports = router;