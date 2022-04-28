const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/auth');
const emailVerify = require('../middleware/emailVerify');
const passwordVerify = require('../middleware/passwordVerify');

//--Route de l'authentification

router.post('/signup', emailVerify, passwordVerify, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;