"use strict";

var SwaggerExpress = require("swagger-express-mw");
const path = require("path");
var express = require("express");
var moment = require("moment");
moment().format();
const _ = require("lodash");
var app = express();
const jwt = require("jsonwebtoken");
const JWTConfig = require("./config/JWTconfig");
module.exports = app; // for testing
const envconfig = require("dotenv").config();
const fs = require("fs");
const glob = require("glob");
const YAML = require("yaml-js");
const extendify = require("extendify");
const bodyParser = require("body-parser");
const logger = require("./config/logger");

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    Bearer: function(req, authOrSecDef, scopesOrApiKey, cb) {
      if (!!scopesOrApiKey && scopesOrApiKey.indexOf("Bearer ") == 0) {
        var JWTToken = scopesOrApiKey.split("Bearer ")[1];

        var current_req_scopes = req.swagger.operation["x-security-scopes"];

        jwt.verify(JWTToken, JWTConfig.secret, async function(err, payload) {
          if (err) {
            req.res.status(403).json({
              status: {
                statusCode: 50002,
                isSuccess: false,
                message: "Failed to authenticate token."
              }
            });
            req.res.end();
            return;
          } else {
            if (_.intersection(payload.scope, current_req_scopes).length == 0) {
              req.res.status(403).json({
                status: {
                  statusCode: 50002,
                  isSuccess: false,
                  message: "Not authorized."
                }
              });
              req.res.end();
              return;
            } else {
              //TODO implement User auth
              cb();
              return;
            }
          }
        });
      } else {
        req.res.status(403).json({
          status: {
            statusCode: 50002,
            isSuccess: false,
            message: "Failed to authenticate token."
          }
        });
        req.res.end();
        return;
      }
    }
  }
};

const initialiceSwagger = () => {
  return new Promise(resolve => {
    glob("./api/swagger/resources/**/*.yaml", async (er, files) => {
      const contents = await files.map(f => {
        return YAML.load(fs.readFileSync(f).toString());
      });
      const extend = await extendify({
        inPlace: false,
        isDeep: true
      });
      const merged = await contents.reduce(extend);
      fs.existsSync("./api/swagger") || fs.mkdirSync("./api/swagger");
      fs.writeFileSync("./api/swagger/swagger.yaml", YAML.dump(merged));
      resolve();
    });
  });
};

initialiceSwagger().then(() => {
  SwaggerExpress.create(config, async (err, swaggerExpress) => {
    if (err) {
      throw err;
    }

    swaggerExpress.register(app);

    var port = process.env.PORT || 10010;
    app.listen(port);

    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

    swaggerExpress.register(app);

    app.use(
      express.static(path.join(config.appRoot, "../../", "frontend/build/"))
    );

    app.get("/*", function(req, res) {
      res.sendFile(
        path.join(
          config.appRoot,
          "../../",
          "frontend/build/",
          "index.html",
          function(err) {
            if (err) {
              res.status(500).send(err);
            }
          }
        )
      );
    });

    logger.log({
      level: "info",
      timestamp: moment(),
      message: `App funcionando [${envconfig.parsed.APP.toUpperCase()}]`
    });
  });
});
