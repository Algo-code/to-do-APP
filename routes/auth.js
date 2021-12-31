const express = require('express');

const router = express.Router();

const auth_controller = require('../controller/auth');


router.get('/signup', auth_controller.get_signup);
router.post('/signup', auth_controller.post_signup);

router.get('/login', auth_controller.get_login);
router.post('/login', auth_controller.post_login);

router.post('/logout', auth_controller.post_logout);

module.exports = router;