"use strict";
const clientService = require("../service/client.service");
const controllerHelper = require("../helpers/controller.helper");
const cookieParser = require("cookie-parser");

//////////////////////////////
const logger = require("../../config/logger");
const MODULE_NAME = "[Auth Controller]";

const authenticate = async (req, res) => {
  try {
    const params = {
      ...req.body
    };

    const data = await clientService.authenticateClient(params);

    res.send(data).status(201);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      authenticate.name,
      error,
      res
    );
  }
};

const recoverPassword = async (req, res) => {
  try {
    const params = {
      ...req.body
    };

    const data = await clientService.recoverPasswordClient(params);

    res.send(data).status(201);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      recoverPassword.name,
      error,
      res
    );
  }
};

module.exports = {
  authenticate,
  recoverPassword
};
