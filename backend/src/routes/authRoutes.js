const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

// POST /login → full path: /api/auth/login (when mounted with prefix /api/auth)
router.post('/login', login);

module.exports = router;
