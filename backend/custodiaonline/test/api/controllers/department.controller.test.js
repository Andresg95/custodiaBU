var should = require("should");
const _ = require("lodash");
var supertest = require("supertest");
var app = require("../../../app");
const expectations = require("../expectations");
const models = require("../../../api/models");
const url = `http://localhost:${expectations.port}`;

describe("controllers", () => {
  let tempToken = "";
  let { departmentId } = expectations;

  //TOKEN
  describe("department", () => {
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

    describe("GET /department/{id}", () => {
      let tempDepartment,
        endpoint = `/department/${departmentId}`;
      before(async done => {
        tempDepartment = await models.department.findByPk(departmentId);
        done();
      });

      it("should return department data for selected id", done =>{

        request
          .get(endpoint)
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect(200)
          .end((err, res)=> {
            should.not.exist(err);
            res.body.id.should.eql(tempDepartment.id);
            res.body.name.should.eql(tempDepartment.name);
            done();
          });

      })

    });
  });
});
