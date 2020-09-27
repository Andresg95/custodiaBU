var should = require("should");
const _ = require("lodash");
var supertest = require("supertest");
var app = require("../../../app");
const expectations = require("../expectations");
const models = require("../../../api/models");
const url = `http://localhost:${expectations.port}`;



describe("controllers", () => {
  let tempToken = "";
  let { clientId } = expectations;
  let nClients;

  describe("client", () => {
    //
    //AUTHORIZATION (BEARER)
    //
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

    //get cliebnt by ID.
    describe("GET /client/{id}", () => {
      let tempClient,
        endpoint = `/client/${clientId}`;
      before(async done => {
        tempClient = await models.client.findByPk(clientId);
        done();
      });

      it("should return client data", done => {
        request
          .get(endpoint)
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res)=> {
            should.not.exist(err);
            if (!_.isNull(tempClient)) {
              res.body.id.should.eql(tempClient.id);
              res.body.company.should.eql(tempClient.company);
            }
            done();
          });
      });
    });

    //ALL CLIENTS
    describe("GET /clients", () => {
      before(async done => {
        nClients = await models.client.count();
        done();
      });
      it("should return all clients", done=> {
        request
          .get("/clients")
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) =>{
            should.not.exist(err);
            res.body.length.should.eql(nClients);
            done();
          });
      });
    });

    //ALL CLIENTS
    describe("GET /clients/{id}/customizationdata", () => {
      let tempClient,
        endpoint = `/client/${clientId}/customizationdata`;
      before(async done => {
        tempClient = await models.client.findByPk(clientId);
        done();
      });

      it("should return selectedColor and avatar", async done => {
        request
          .get(endpoint)
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect(200)
          .end((err, res)=> {
            should.not.exist(err);
            res.body.color.should.eql(tempClient.color);
            res.body.avatar.should.startWith("data:image");
            done();
          });
      });
    });
  });
});
