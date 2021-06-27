const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var session = require('express-session');
const config = require("./config/config");
var pathfinderUI = require('pathfinder-ui');

const app = express()
const port = config.port
const api = require('./api')

var corsOptions = {
	origin: "http://localhost:3000"
};

app.use(fileUpload({
	createParentPath: true
}));

app.use(session({
	secret: config.secret,
	resave: true,
	saveUninitialized: true
}));

app.use('/pathfinder', function(req, res, next){
	pathfinderUI(app);
	next();
  }, pathfinderUI.router);

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/v1', api)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app

