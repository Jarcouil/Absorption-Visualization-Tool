process.env.NODE_ENV = 'test';
var faker = require('faker');
let server = require("../index");
let chai = require("chai");
let chaiHttp = require("chai-http");
const userController = require("../controllers/userController");
const measurementController = require("../controllers/measurementController");
const fileController = require("../controllers/fileController");

// Assertion 
chai.should();
chai.use(chaiHttp);
let user = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }
let user2 = { username: faker.name.findName(), email: faker.internet.email(), password: faker.random.alphaNumeric(6) }
let measurement1 = {name: faker.random.word(), description: faker.lorem.sentence()}

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

function addMeasurement(name, description) {
    return fileController.addToMeasurements(faker.random.word(), faker.lorem.sentence(), user.id, faker.datatype.number(3200))
}

describe('Measurements API', () => {
    before(function (done) {
        userController.deleteAllUsers().then(done())
    })
    after(function (done) {
        userController.deleteAllUsers().then()
        measurementController.deleteAllMeasurements().then(done())
    });

    describe("It should GET measurements without a token", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .get("/v1/measurement")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("No token provided!");
                    done();
                });
        });
    })

    describe("It should GET measurements with an invalid token", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .get("/v1/measurement")
                .set("x-access-token", faker.random.alphaNumeric(148))
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("Unauthorized!");
                    done();
                });
        });
    })

    describe("It should GET measurements with a valid token", () => {
        it("It should give an error", (done) => {
            registerUser(user).then(res => login(user.username, user.password)
                .then(userResult => {
                    user = userResult
                    chai.request(server)
                        .get("/v1/measurement")
                        .set("x-access-token", user.accessToken)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.message.should.be.equal("Er zijn geen metingen gevonden");
                            done();
                        });
                })
            )
        });
    })

    describe("It should GET all measurements with a valid token without admin rights", () => {
        it("It should give an error", (done) => {
            chai.request(server)
                .get("/v1/measurement/all")
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.message.should.be.equal("Require Admin Role!");
                    done();
                });            
        });
    })

    describe("It should GET all measurements with a valid token with admin rights", () => {
        it("It should give an error", (done) => {
            userController.toggleAdmin(user.id).then(result => {
                chai.request(server)
                .get("/v1/measurement/all")
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.equal("Er zijn geen metingen gevonden");
                    done();
                });
            })
        });
    })

    describe("It should GET all measurements with a valid token with admin rights", () => {
        it("It should give array with 1 measurement", (done) => {
            addMeasurement(measurement1.name, measurement1.description).then(result => {
                chai.request(server)
                .get("/v1/measurement")
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    measurement1 = res.body.data[0]
                    res.body.data.should.be.an.instanceof(Array);
                    res.body.data.length.should.be.equal(1);
                    res.body.data[0].should.include.all.keys(['id', 'name', 'description', 'createdAt', 'samplingRate']);
                    res.should.have.status(200);
                    done();
                });
            })
        });
    })

    describe("It should GET measurement1 with a valid token with admin rights", () => {
        it("It should give measurement1", (done) => {
            chai.request(server)
                .get(`/v1/measurement/${measurement1.id}`)
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    res.body.should.include.all.keys(['id', 'name', 'description', 'createdAt', 'createdBy', 'samplingRate']);
                    res.body.id.should.be.equal(measurement1.id);
                    res.body.name.should.be.equal(measurement1.name);
                    res.body.description.should.be.equal(measurement1.description);
                    res.body.createdAt.should.be.equal(measurement1.createdAt);
                    res.should.have.status(200);
                    done();
                });
        });
    })

    describe("It should GET a measurement with a random id", () => {
        it("It should give measurement1", (done) => {
            chai.request(server)
                .get(`/v1/measurement/${faker.random.alphaNumeric()}`)
                .set("x-access-token", user.accessToken)
                .end((err, res) => {
                    res.body.message.should.be.equal('Kon de meting niet vinden!');
                    res.should.have.status(404);
                    done();
                });
        });
    })

    describe("It should GET measurements after other user has added a measurement", () => {
        it("It should give an error", (done) => {
            registerUser(user2).then(res => login(user2.username, user2.password)
                .then(userResult => {
                    user2 = userResult
                    chai.request(server)
                        .get("/v1/measurement")
                        .set("x-access-token", user2.accessToken)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.message.should.be.equal("Er zijn geen metingen gevonden");
                            done();
                        });
                })
            )
        });
    })

    describe("It should GET measurement1 of user1 with with user2 without admin rights", () => {
        it("It should an error", (done) => {
            chai.request(server)
                .get(`/v1/measurement/${measurement1.id}`)
                .set("x-access-token", user2.accessToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.equal("Kon de meting niet vinden!");
                    done();
                });
        });
    })

    describe("It should DELETE measurement1 of user1 with with user2 without admin rights", () => {
        it("It should an error", (done) => {
            chai.request(server)
                .delete(`/v1/measurement/${measurement1.id}`)
                .set("x-access-token", user2.accessToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.equal("Kon de meting niet vinden!");
                    done();
                });
        });
    })

    describe("It should GET measurement1 of user1 with with user2 with admin rights", () => {
        it("It should an error", (done) => {
            userController.toggleAdmin(user2.id).then(result => {
                chai.request(server)
                .get(`/v1/measurement/${measurement1.id}`)
                .set("x-access-token", user2.accessToken)
                .end((err, res) => {
                    res.body.should.include.all.keys(['id', 'name', 'description', 'createdAt', 'createdBy', 'samplingRate']);
                    res.body.id.should.be.equal(measurement1.id);
                    res.body.name.should.be.equal(measurement1.name);
                    res.body.description.should.be.equal(measurement1.description);
                    res.body.createdAt.should.be.equal(measurement1.createdAt);
                    res.should.have.status(200);
                    done();
                });
            })
        });
    })

    describe("It should DELETE measurement1 of user1 with with user2 with admin rights", () => {
        it("It should return succes message", (done) => {
            chai.request(server)
                .delete(`/v1/measurement/${measurement1.id}`)
                .set("x-access-token", user2.accessToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.equal(`Meting ${measurement1.name} is succesvol verwijderd`);
                    done();
                });
        });
    })

    describe("It should DELETE random measurement", () => {
        it("It should return an error", (done) => {
            chai.request(server)
                .delete(`/v1/measurement/${faker.random.alphaNumeric()}`)
                .set("x-access-token", user2.accessToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.equal("Kon de meting niet vinden!");
                    done();
                });
        });
    })

    describe("It should GET all measurements after all were deleted", () => {
        it("It should give an error", (done) => {
            chai.request(server)
            .get("/v1/measurement/all")
            .set("x-access-token", user.accessToken)
            .end((err, res) => {
                res.should.have.status(404);
                res.body.message.should.be.equal("Er zijn geen metingen gevonden");
                done();
            });
        });
    })
})