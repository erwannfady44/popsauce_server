var express = require('express');
var router = express.Router();

const gameController = require('../controllers/game');

/* GET users listing. */
router.get('/create', gameController.create);

module.exports = router;
