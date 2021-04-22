const router = require('express').Router({ mergeParams: true });
const login_controller = require("../controllers/login_controller");
const jwt = require('jsonwebtoken');

router.post('', login);

function login(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        login_controller.login(username, password).then(
            (result) => {
                if (result.length > 0 ) {
                    req.session.loggedin = true;
                    req.session.username = username;
    
                    var token = jwt.sign({userID: result.id}, 'todo-app-super-shared-secret', {expiresIn: '2h'});
                    return res.send({token});
                } else {
                    return res.status(400).json({ message: 'Incorrect Username and/or Password!'});
                }
                
            },
            (error) => {
                return res.status(500).json({ message: error });
            }
        );
    } else {
        return res.status(400).json({ message: 'Please enter username and password'});
    }  
    
}

module.exports = router;
