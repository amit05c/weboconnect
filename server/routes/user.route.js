const express = require('express');
const router = express.Router();
const { userRegister, userLogin } = require('../controllers/userController');

// User Registration
router.post('/register', userRegister);

// User Login
router.post('/login',userLogin);

module.exports = router;
