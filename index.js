const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var session = require('express-session');

const app = express()
const port = 3000
const api = require('./api')

var corsOptions = {
	origin: "http://localhost:3000"
  };

app.use(fileUpload({
    createParentPath: true
}));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(cors(corsOptions));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use('/v1', api)

const db = require("./models");
const Role = db.role;

db.sequelize.sync();

// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function initial() {
	Role.create({
	  id: 1,
	  name: "user"
	});
   
	Role.create({
	  id: 2,
	  name: "moderator"
	});
   
	Role.create({
	  id: 3,
	  name: "admin"
	});
  }
