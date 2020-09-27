var should = require("should");
const _ = require("lodash");
var supertest = require("supertest");
var app = require("../../../app");
const expectations = require("../expectations");
const models = require("../../../api/models");
const url = `http://localhost:${expectations.port}`;

describe("controllers", () => {
  let tempToken = "";
  let { userId } = expectations;

  describe("user", () => {
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

    describe("GET /user/{id}", () => {
      let tempUser,
        endpoint = `/user/${userId}`;
      before(async done => {
        tempUser = await models.user.findByPk(userId);
        done();
      });

      it("should return user data", done =>{

        request
          .get(endpoint)
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res)=> {
            should.not.exist(err);
            if (!_.isNull(tempUser)) {
              res.body.id.should.eql(tempUser.id);
              res.body.client_id.should.eql(tempUser.client_id);
            }
            done();
          });

      })
    });
  });
});
