process.env.NODE_ENV = 'test';
var faker = require('faker');
let server = require("../index");
let chai = require("chai");
let chaiHttp = require("chai-http");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

chai.should();
chai.use(chaiHttp);

function registerUser(user) {
    return chai.request(server)
            .post("/v1/auth/register")
            .send(user)
            .end();
}

describe('Register Auth API', () => {
    const user = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }

    after(function (done) {
        userController.deleteAllUsers().then(done())
    });

    describe("It should POST a register wihtout username", () => {
        it("It should not create a new user", (done) => {
            const registerForm = { email: user.email, password: user.password }
            chai.request(server)
                .post("/v1/auth/register")
                .send(registerForm)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Gebruikersnaam is verplicht!");
                    done();
                });
        });
    })

    describe("it should POST without an email", () => {
        it("It should not create a new user", (done) => {
            const registerForm = { username: user.username, password: user.password }
            chai.request(server)
                .post("/v1/auth/register")
                .send(registerForm)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Emailadres is verplicht!");
                    done();
                });
        });
    })

    describe("it should POST without a password", () => {
        it("It should not create a new user", (done) => {
            const registerForm = { username: user.username, email: user.email, }
            chai.request(server)
                .post("/v1/auth/register")
                .send(registerForm)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Wachtwoord is verplicht!");
                    done();
                });
        });
    })

    describe("it should POST without a too short password", () => {
        it("It should not create a new user", (done) => {
            const registerForm = { username: user.username, password: faker.random.alphaNumeric(5), email: user.email }
            chai.request(server)
                .post("/v1/auth/register")
                .send(registerForm)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Wachtwoord moet minimaal 6 tekens lang zijn!");
                    done();
                });
        });
    })

    describe("it should POST without a valid email", () => {
        it("It should not create a new user", (done) => {
            const registerForm = { username: user.username, email: faker.random.word(), password: user.password }
            chai.request(server)
                .post("/v1/auth/register")
                .send(registerForm)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Helaas! Dit emailadres is helaas niet geldig!");
                    done();
                });
        });
    })

    describe("it should POST a complete register form", () => {
        it("It should create a new user", (done) => {
            chai.request(server)
                .post("/v1/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.equal("Account is succesvol geregistreerd!");
                    done();
                });
        });
    })

    describe("it should POST with a duplicate username", () => {
        it("It should give an error", (done) => {
            const user2 = { username: user.username, email: faker.internet.email(), password: faker.random.alphaNumeric(6) }
            chai.request(server)
                .post("/v1/auth/register")
                .send(user2)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Helaas! Deze gebruikersnaam is helaas al in gebruik!");
                    done();
                });
        });
    })

    describe("it should POST with a duplicate email", () => {
        it("It should give an error", (done) => {
            const user3 = { username: faker.name.findName(), email: user.email, password: faker.random.alphaNumeric(6) }
            chai.request(server)
                .post("/v1/auth/register")
                .send(user3)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Helaas! Dit emailadres is helaas al in gebruik!");
                    done();
                });
        });
    })
})

describe('Login Auth API', () => {
    const user = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }
    before(function (done) {
        registerUser(user)
        done()
    });

    after(function (done) {
        userController.deleteAllUsers().then(done());
    });

    describe("it should POST a login without username", () => {
        it("It should give a login error", (done) => {
            chai.request(server)
                .post("/v1/auth/login")
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Gebruikersnaam is verplicht!");
                    done();
                });
        });
    })

    describe("it should POST a login without password", () => {
        it("It should give a login error", (done) => {
            chai.request(server)
                .post("/v1/auth/login")
                .send({username: user.username})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Wachtwoord is verplicht!");
                    done();
                });
        });
    })

    describe("it should POST a login with the wrong credentials", () => {
        it("It should  login", (done) => {
            const logincredentials = {
                username: faker.name.findName(),
                password: faker.random.word()
            }
            chai.request(server)
                .post("/v1/auth/login")
                .send(logincredentials)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("De combinatie van gebruikersnaam en wachtwoord is niet correct!");
                    done();
                });
        });
    })

    describe("it should POST a login", () => {
        it("It should  login", (done) => {
            const logincredentials = {
                username: user.username,
                password: user.password
            }
            chai.request(server)
                .post("/v1/auth/login")
                .send(logincredentials)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('id');
                    res.body.should.have.property('username').eq(user.username);
                    res.body.should.have.property('email').eq(user.email);
                    done();
                });
        });
    })
})

describe('Reset password Auth API', () => {
    const user = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }
    before(function (done) {
        registerUser(user)
        done()
    });

    after(function (done) {
        userController.deleteAllUsers().then()
        authController.deleteAllResetTokens().then(done())
    });

    describe("it should POST without an email", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/auth/reset")
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Email is verplicht!");
                    done();
                });
        });
    })

    describe("it should POST with a unknown email", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/auth/reset")
                .send({ email: faker.internet.email() })
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.equal("Email niet gevonden!");
                    done();
                });
        });
    })

    describe("it should POST with the correct email", () => {
        it("It should send an email", (done) => {
            chai.request(server)
                .post("/v1/auth/reset")
                .send({ email: user.email })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.equal("Mail is succesvol verzonden.");
                    done();
                });
        });
    })
});