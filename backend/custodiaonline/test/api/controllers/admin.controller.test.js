var should = require("should");
const _ = require("lodash");
var supertest = require("supertest");
var app = require("../../../app");
const expectations = require("../expectations");
const models = require("../../../api/models");
const url = `http://localhost:${expectations.port}`;

describe("controllers", () => {
  let tempToken = "";
  let { adminId } = expectations;

  describe("admin", () => {
    request = supertest.agent(url);
    before(done => {
      request
        .post("/authenticate")
        .set("Accept", "application/json")
        .send(expectations.auth)
        .expect(200)
        .end((err, res) => {
          tempToken = res.body.token;
          !_.isUndefined(tempToken)
            ? console.log("Authorized!")
            : console.error("Wrong credentials!");
          done();
        });
    });

    describe("GET /admins", () => {
      let nAdmins;
      before(async done => {
        nAdmins = await models.admin.count();
        done();
      });

      it("should return all admins", async done => {
        request
          .get("/clients")
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.length.should.eql(nAdmins);
            done();
          });
      });
    });

    describe("GET /admin/{id}", () => {
      let tempAdmin,
        endpoint = `/admin/${adminId}`;

      before(async done => {
        tempAdmin = await models.admin.findByPk(adminId);
        done();
      });

      it("should return admin email and hashed pass", done => {
        request
          .get(endpoint)
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            if (!_.isNull(tempAdmin)) {
              res.body.email.should.eql(tempAdmin.email);
              res.body.password.should.eql(tempAdmin.password);
            }
            done();
          });
      });
    });
  });
});
