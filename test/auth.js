process.env.NODE_ENV = 'test';

let server = require("../index");
let chai = require("chai");
let chaiHttp = require("chai-http");

// Assertion 
chai.should();
chai.use(chaiHttp);

describe('Auth APIs', () => {
    describe("it should POST a login", () => {
        it("It should give a login error", (done) => {
            chai.request(server)
                .post("/v1/auth/login")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.equal("De combinatie van gebruikersnaam en wachtwoord is niet correct!");
                    done();
                });
        });
    })

    describe("it should POST a login", () => {
        it("It should give a login error", (done) => {
            const logincredentials = {
                username: "admin",
                password: "password"
            }
            chai.request(server)
                .post("/v1/auth/login")
                .send(logincredentials)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('id').eq(1)
                    done();
                });
        });
    })
})