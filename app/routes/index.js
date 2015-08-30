var express = require('express');
var router = express.Router();

router.use('/', require('app/routes/home'));
router.use('/', require('app/routes/auth'));

module.exports = router;
