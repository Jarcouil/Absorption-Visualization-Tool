const router = require('express').Router({mergeParams: true});
const file = require('./file');
const measurement = require('./measurement');

router.get('/', noContent)

router.use('/file', file)
router.use('/measurement', measurement)

function noContent(req, res, next){
    return res.send('No content for /');
}

module.exports = router;
