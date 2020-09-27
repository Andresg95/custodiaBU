var should = require("should");
const _ = require("lodash");
var supertest = require("supertest");
var app = require("../../../app");
const expectations = require("../expectations");
const models = require("../../../api/models");
const url = `http://localhost:${expectations.port}`;

describe("controllers", () => {
  let tempToken = "";
  let nPlans;
  let { planId } = expectations;

  //TOKEN
  describe("plans", () => {
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

    describe("GET /plan/{id}", () => {
      let tempPlan,
        endpoint = `/plan/${planId}`;
      before(async done => {
        tempPlan = await models.plan.findByPk(planId);
        done();
      });

      it("should return department data for selected id", done => {
        request
          .get(endpoint)
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.plan.id.should.eql(tempPlan.id);
            res.body.plan.description.should.eql(tempPlan.description);
            res.body.plan.quote.should.eql(tempPlan.quote);
            done();
          });
      });
    });

    describe("GET /PLANS", () => {
      before(async done => {
        nPlans = await models.plan.count();
        done();
      });

      it("should return all plans", done => {
        request
          .get("/plans")
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.plan.length.should.eql(nPlans);
            done();
          });
      });
    });
  });
});
