process.env.NODE_ENV = 'test';
var faker = require('faker');
let server = require("../index");
let chai = require("chai");
let chaiHttp = require("chai-http");
const userController = require("../controllers/userController");

// Assertion 
chai.should();
chai.use(chaiHttp);
let user = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }
let user2 = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }
let user3 = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }

function registerUser(user) {
    return new Promise(function (resolve, reject) {
        chai.request(server)
            .post("/v1/auth/register")
            .send(user)
            .end((err, res) => {
                resolve();
            })
    });
}

function login(username, password) {
    return new Promise(function (resolve, reject) {
        chai.request(server)
            .post("/v1/auth/login")
            .send({
                username: username,
                password: password
            })
            .end((err, res) => {
                resolve(res.body)
            });
    });
}

describe('User API', () => {
    before(function (done) {
        userController.deleteAllUsers().then(done())
    })
    after(function (done) {
        userController.deleteAllUsers().then(done())
    });

    describe("It should GET users without a token", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .get("/v1/users")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("No token provided!");
                    done();
                });
        });
    })

    describe("It should GET users with an invalid token", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .get("/v1/users")
                .set("x-access-token", faker.random.alphaNumeric(148))
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("Unauthorized!");
                    done();
                });
        });
    })

    describe("It should GET users with a valid token without admin rights", () => {
        it("It should give an error", (done) => {
            registerUser(user).then(res => login(user.username, user.password)
                .then(userResult => {
                    user = userResult
                    chai.request(server)
                        .get("/v1/users")
                        .set("x-access-token", user.accessToken)
                        .end((err, res) => {
                            res.should.have.status(403);
                            res.body.message.should.be.equal("Require Admin Role!");
                            done();
                        });
                })
            )
        });
    })

    describe("It should GET users with a valid token with admin rights", () => {
        it("It give an array of users", (done) => {
            userController.toggleAdmin(user.id).then(result => {
                chai.request(server)
                    .get("/v1/users")
                    .set("x-access-token", user.accessToken)
                    .end((err, res) => {
                        res.body.should.be.an.instanceof(Array);
                        res.body.length.should.be.equal(1);
                        res.body[0].should.include.all.keys(['id', 'username', 'email', 'isAdmin', 'createdAt']);
                        res.body[0].id.should.be.equal(user.id);
                        res.body[0].username.should.be.equal(user.username);
                        res.body[0].email.should.be.equal(user.email);
                        res.body[0].isAdmin.should.be.equal(1);
                        res.body[0].createdAt.should.be.equal(user.createdAt);
                        res.should.have.status(200);
                        done();
                    });
            })
        })
    })

    describe("It should GET users with a valid token with admin rights after adding another user", () => {
        it("It give an array of users with 2 users", (done) => {
            registerUser(user2).then(_ => {
                chai.request(server)
                    .get("/v1/users")
                    .set("x-access-token", user.accessToken)
                    .end((err, res) => {
                        res.body.should.be.an.instanceof(Array);
                        res.body.length.should.be.equal(2);
                        res.body[0].should.include.all.keys(['id', 'username', 'email', 'isAdmin', 'createdAt']);
                        res.should.have.status(200);
                        done();
                    });
            })
        })
    })

    describe("It should GET 1 user with a valid token", () => {
        it("It give an object of user 1", (done) => {
            chai.request(server)
                .get(`/v1/users/${user.id}`)
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    res.body.should.include.all.keys(['id', 'username', 'email', 'isAdmin', 'createdAt']);
                    res.body.id.should.be.equal(user.id);
                    res.body.username.should.be.equal(user.username);
                    res.body.email.should.be.equal(user.email);
                    res.body.isAdmin.should.be.equal(1);
                    res.body.createdAt.should.be.equal(user.createdAt);
                    res.should.have.status(200);
                    done();
                });
        })
    })

    describe("It should GET user with a wrong id", () => {
        it("It give an error", (done) => {
            chai.request(server)
                .get(`/v1/users/${faker.datatype.number(-1)}`)
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    res.body.message.should.be.equal('Gebruiker is niet gevonden');
                    res.should.have.status(404);
                    done();
                });
        })
    })

    describe("It should delete user with a wrong id", () => {
        it("It give an error", (done) => {
            chai.request(server)
                .delete(`/v1/users/${faker.datatype.number(-1)}`)
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    res.body.message.should.be.equal('Gebruiker is niet gevonden');
                    res.should.have.status(404);
                    done();
                });
        })
    })

    describe("It should delete user with a correct id without admin rights", () => {
        it("It give an error", (done) => {
            login(user2.username, user2.password)
                .then(userResult => {
                    user2 = userResult
                    chai.request(server)
                        .delete(`/v1/users/${user.id}`)
                        .set("x-access-token", user2.accessToken)
                        .end((err, res) => {
                            res.body.message.should.be.equal("Require Admin Role!");
                            res.should.have.status(403);
                            done();
                        });
                })
        })
    })

    describe("It should delete user with a correct id with admin rights", () => {
        it("It give an error", (done) => {
            registerUser(user3).then(res => login(user3.username, user3.password)
                .then(userResult => {
                    user3 = userResult
                    userController.toggleAdmin(user3.id).then(result => {
                        chai.request(server)
                            .delete(`/v1/users/${user.id}`)
                            .set("x-access-token", user3.accessToken)
                            .end((err, res) => {
                                res.body.message.should.be.equal(`Gebruiker ${user.username} is succesvol verwijderd`);
                                res.should.have.status(200);
                                done();
                            });
                    })
                })
            )
        })
    })

    describe("It should GET users with a valid token with admin rights", () => {
        it("It give an array of users with user2 and user3", (done) => {
            chai.request(server)
                .get("/v1/users")
                .set("x-access-token", user3.accessToken)
                .end((err, res) => {
                    res.body.should.be.an.instanceof(Array);
                    res.body.length.should.be.equal(2);
                    res.body[0].should.include.all.keys(['id', 'username', 'email', 'isAdmin', 'createdAt']);
                    res.body[0].id.should.be.equal(user2.id);
                    res.body[0].username.should.be.equal(user2.username);
                    res.body[0].email.should.be.equal(user2.email);
                    res.body[0].isAdmin.should.be.equal(0);
                    res.body[0].createdAt.should.be.equal(user2.createdAt);
                    res.body[1].id.should.be.equal(user3.id);
                    res.body[1].username.should.be.equal(user3.username);
                    res.body[1].email.should.be.equal(user3.email);
                    res.body[1].isAdmin.should.be.equal(1);
                    res.body[1].createdAt.should.be.equal(user3.createdAt);
                    res.should.have.status(200);
                    done();
                });
        })
    })
});