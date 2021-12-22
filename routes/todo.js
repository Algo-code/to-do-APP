const express = require('express');

const router = express.Router();

const todo_controller = require('../controller/todo');


/**
 * Routes
*/

router.get('/', todo_controller.get_tasks);

router.get('/create', todo_controller.create_task_get);
router.post('/create', todo_controller.create_task_post);

router.get('/:id', todo_controller.get_task);
router.get('/:board', todo_controller.get_task_board);

module.exports = router;