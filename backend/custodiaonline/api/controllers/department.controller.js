const _ = require("lodash");
const departmentService = require("../service/department.service");
const messaggeHelper = require("../helpers/message.helper");
const { msg, err } = require("../helpers/constants.helper");
const controllerHelper = require("../helpers/controller.helper");

const MODULE_NAME = "[Department Controller]";

const getDepartmentById = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    const result = await departmentService.getDepartment(id);
    res.status(200).json(result);
    
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getDepartmentById.name,
      error,
      res
    );
  }
};

const createDepartment = async (req, res) => {
  try {
    let finalResult;
    const params = { ...req.body };
    const data = await departmentService.createDepartment(params);

    if (
      !_.isNull(data) &&
      !_.isUndefined(data) &&
      !_.isEqualWith(data, "client not found")
    ) {
          finalResult = await messaggeHelper.handleSuccessResponse(true, data);
      res.status(200).json(finalResult);
    }
    if (_.isEqualWith(data, "client not found")) {
      finalResult = data;
      res.status(400).json(finalResult);
    } else {
      finalResult = await messaggeHelper.handleErrorReponse(
        false,
        data,
        "400",
        "ECCONNREFUSED",
        err.GEN_ERR_BD_UNREACHABLE
      );
      res.status(400).send(finalResult);
    }
  } catch (error) {
    res
      .status(500)
      .send(JSON.stringify("error in controller", createDepartment));
  }
};
const deleteDepartmentById = async (req, res) => {
  try {
    let finalResult;
    const id = req.swagger.params.id.value;
    const data = await departmentService.deleteDepartmentById(id);

      if (!_.isNull(data) && !_.isUndefined(data)) {
      finalResult = await messaggeHelper.handleSuccessResponse(
        true,
        msg.DP_CT_DEPARTMENT_DELETED_SUCCESFULLY
      );
      res.status(200).json(finalResult);
    } else {
      finalResult = await messaggeHelper.handleErrorReponse(
        false,
        data,
        "404",
        err.GEN_ERR_NOT_FOUND,
        err.US_CT_ERR_CREATE_DB_UNREACHABLE
      );
      res.status(404).send(finalResult);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(JSON.stringify("error in controller", deleteDepartmentById));
  }
};

module.exports = {
  getDepartmentById,
  deleteDepartmentById,
  createDepartment
};
