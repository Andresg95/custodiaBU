"use strict";
const _ = require("lodash");

const controllerHelper = require("../helpers/controller.helper");
const fieldService = require("../service/field.service");

const MODULE_NAME = "[File Controller]";

const getFieldsByDepartments = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    const data = await fieldService.getFieldsByDepartments(id);

    res.status(200).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getFiles.name,
      error,
      res
    );
  }
};

module.exports = {
    getFieldsByDepartments
};
