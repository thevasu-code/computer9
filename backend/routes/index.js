var express = require('express');
var router = express.Router();


// GET home page (API root)
router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to the Computer & Hardware API' });
});

module.exports = router;
