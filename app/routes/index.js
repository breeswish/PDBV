var express = require('express');
var router = express.Router();

router.use('/', require('app/routes/home'));
router.use('/', require('app/routes/auth'));
router.use('/', require('app/routes/rooms'));
router.use('/', require('app/routes/structure'));

module.exports = router;
