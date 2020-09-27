const models = require("../models");
const { logger } = require("../../config/logger");

var moment = require("moment");
moment().format();

const getFieldById = async id => {
  try {
    return await models.field.findOne({
      where: {
        id
      }
    });
  } catch (error) {
    logger.log({
      level: "warn",
      message: `Hubo un problema al intentar obtener un campo (field): ${error.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "getFieldById()",
      request_status: "fail",
      request_data: {
        id
      }
    });
    return error;
  }
};

const getFieldsByDepartments = async id => {
  return await models.field.findAll({
    where: {
      department_id: id
    }
  });
};

module.exports = {
  getFieldById,
  getFieldsByDepartments
};
