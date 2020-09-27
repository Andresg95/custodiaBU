var should = require("should");
const _ = require("lodash");
const Sequelize = require("sequelize");
var supertest = require("supertest");
var app = require("../../../app");
const expectations = require("../expectations");
const models = require("../../../api/models");
const url = `http://localhost:${expectations.port}`;

describe("controllers", () => {
  let nFiles, tempToken;
  let { adminId, fileId, departmentId } = expectations;
  let Op = Sequelize.Op;

  describe("FILES", () => {
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

    describe("/FILES", () => {
      let expectedResponse = {};
      let endpoint = `/files?id=${adminId}&role=admin`;

      before(async done => {
        expectedResponse.totalCount = await models.file.count();
        let data = await models.file.findAll({
          where: {
            etag: {
              [Op.not]: null
            }
          },
          limit: 10
        });

        expectedResponse.data = await Promise.all(data.map(async file => {
          //include department and client for full object assertion
          let {
            dataValues: { name, client: id }
          } = await models.department.findByPk(file.dataValues.department_id);
          let {
            dataValues: { company: client }
          } = await models.client.findOne({
            where: { id }
          });
          file.dataValues.department = name;
          file.dataValues.client = client;
          return file.dataValues;
        }));
        done();
      });

      it("GET ALL FILES", done => {
        request
          .get(endpoint)
          .set("Accept", "application/json")
          .set("Authorization", tempToken)
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);
            res.body.should.eql(expectedResponse);
            done();
          });
      });
    });



    describe("GET /file/download", () => {
        let endpoint= `/file/download?id=${fileId}`
    
        it("should return downloadable file", done => {
          request
            .get(endpoint)
            .set("Accept", "application/json")
            .set("Authorization", tempToken)
            .expect("Content-Type", "text/html; charset=utf-8")
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              //return image string buffer
              (!_.isUndefined(res.text))
              done();
            });
        });
      });


      describe("GET /file/preview/{id}", () => {
        let endpoint= `/file/preview/${fileId}`
    
        it("should return base64 of pictures/pdfs", done => {
          request
            .get(endpoint)
            .set("Accept", "application/json")
            .set("Authorization", tempToken)
            .expect("Content-Type", "text/html; charset=utf-8")
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              //will fail if file.extension != jpg/png || pdf;
              (!_.isUndefined(res.text))
              done();
            });
        });
      });

     
     describe("GET /files/department/{id}", () => {
        let endpoint= `/files/department/${departmentId}`;
        let expectedResponse = {};
        
        before(async done => {
            expectedResponse.totalCount = await models.file.count();
            let data = await models.file.findAll({
              where: {
                etag: {
                  [Op.not]: null
                },
                department_id: departmentId
              },
              limit: 10
            });

            expectedResponse.data = data.map( file =>file.dataValues);
            done();
          });
    
        it("should return all files for a specific department ", done => {
          request
            .get(endpoint)
            .set("Accept", "application/json")
            .set("Authorization", tempToken)
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200)
            .end((err, res) => {
              should.not.exist(err);
              res.body.data.length.should.eql(expectedResponse.data.length);
              done();
            });
        });
      });



  });
});
