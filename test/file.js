process.env.NODE_ENV = 'test';
var faker = require('faker');
let server = require("../index");
let chai = require("chai");
let chaiHttp = require("chai-http");
const fileController = require("../controllers/fileController");
const userController = require("../controllers/userController");
const fileSystem = require('mock-fs');
const path = require('path');

chai.should();
chai.use(chaiHttp);

let user = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }

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

describe('File API', () => {
    before(function (done) {
        fileSystem.restore();
        userController.deleteAllUsers().then(done())
    })
    after(function (done) {
        userController.deleteAllUsers().then()
        fileSystem.restore(done());
    });

    describe("It should POST file without a token", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/file/upload-file")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("No token provided!");
                    done();
                });
        });
    })

    describe("It should POST file without an invalid token", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/file/upload-file")
                .set("x-access-token", faker.random.alphaNumeric(148))
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("Unauthorized!");
                    done();
                });
        });
    })

    describe("It should POST file with a valid token without file", () => {
        it("It should give an error", (done) => {
            registerUser(user).then(res => login(user.username, user.password)
                .then(userResult => {
                    user = userResult
                    chai.request(server)
                        .post("/v1/file/upload-file")
                        .set("x-access-token", user.accessToken)
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.message.should.be.equal("Bestand is verplicht!");
                            done();
                        });
                })
            )
        });
    })

    describe("It should POST file with a wrong extension", () => {
        it("It should give an error", (done) => {
            fileSystem({
                'textfile.txt': 'content here'
            })
            chai.request(server)
                .post("/v1/file/upload-file")
                .set("x-access-token", user.accessToken)
                .attach('file', 'textfile.txt')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Bestand moet het .dad extensie hebben!");
                    done();
                });
        })
    })

    describe("It should POST file with the right extension without a name", () => {
        it("It should give an error", (done) => {
            fileSystem({
                'dadfile.dad': 'content here'
            })
            chai.request(server)
                .post("/v1/file/upload-file")
                .set("x-access-token", user.accessToken)
                .attach('file', 'dadfile.dad')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Naam is verplicht!");
                    done();
                });
        })
    })

    describe("It should POST file without a minimal wavelength", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/file/upload-file")
                .set("x-access-token", user.accessToken)
                .field({name: faker.random.word()})
                .attach('file', 'dadfile.dad')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Minimale golflengte is verplicht!");
                    done();
                });
        })
    })

    describe("It should POST file without a maximal wavelength", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/file/upload-file")
                .set("x-access-token", user.accessToken)
                .field({name: faker.random.word()})
                .field({minWaveLength: faker.random.alphaNumeric(200)})
                .attach('file', 'dadfile.dad')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Maximale golflengte is verplicht!");
                    done();
                });
        })
    })

    describe("It should POST file without a description", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/file/upload-file")
                .set("x-access-token", user.accessToken)
                .field({name: faker.random.word()})
                .field({minWaveLength: faker.random.alphaNumeric()})
                .field({maxWaveLength: faker.random.alphaNumeric()})
                .attach('file', 'dadfile.dad')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Beschrijving is verplicht!");
                    done();
                });
        })
    })

    describe("It should POST file with a lower max than min wavelength", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .post("/v1/file/upload-file")
                .set("x-access-token", user.accessToken)
                .field({name: faker.random.word()})
                .field({minWaveLength: 1000})
                .field({maxWaveLength: 500})
                .field({description: faker.random.words(10)})
                .attach('file', 'dadfile.dad')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.equal("Minimale golflengte moet minder zijn dan de maximale golflengte!");
                    done();
                });
        })
    })
})