const router = require('express').Router({ mergeParams: true });
const file = require('./file');
const measurement = require('./measurement');
const auth = require('./auth');
const user = require('./user');

router.get('/', noContent)

router.use('/file', file)
router.use('/measurement', measurement)
router.use('/auth', auth)
router.use('/user', user)

function noContent(req, res, next) {
    return res.send('No content for /');
}

module.exports = router;
