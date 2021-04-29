const router = require('express').Router({ mergeParams: true });
const file = require('./file');
const measurement = require('./measurement');
const auth = require('./auth');
const user = require('./user');
const { authJwt } = require("../middleware");

router.get('/', noContent)

router.use('/file', [authJwt.verifyToken], file)
router.use('/measurement', [authJwt.verifyToken], measurement)
router.use('/auth', auth)
router.use('/users', [authJwt.verifyToken], user)

function noContent(req, res, next) {
    return res.send('No content for /');
}

module.exports = router;
