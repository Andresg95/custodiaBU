const Sequelize = require("sequelize");
const models = require("../models");
const department = models.department;
const clientService = require("./client.service");
const _ = require("lodash");
const logger = require("../../config/logger");

var moment = require("moment");
moment().format();

const getDepartment = async id => {
  try {
    return await department.findOne({
      include: [
        {
          model: models.user,
          attributes: { exclude: ["department_id", "client_id"] }
        }
      ],
      where: {
        id
      }
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: `Ha habido un problema al intentar obtener un departmento: ${error.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "getDepartment()",
      request_status: "fail",
      request_data: {
        id
      }
    });
    return error;
  }
};

const createDepartment = async params => {
  const { client_id, name } = params;
  try {
    const checkClient = await clientService.getClientById(client_id);
    if (!_.isNull(checkClient)) {
      return await department.create({
        name,
        client: client_id
      });
    } else {
      return "client not found";
    }
  } catch (error) {
    logger.log({
      level: "error",
      message: `Ha habido un problema al intentar crear el departamento: ${error.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "createDepartment()",
      request_status: "fail",
      request_data: {
        client_id,
        name
      }
    });

    throw error;
  }
};

const deleteDepartmentById = async id => {
  if (await checkExistantDepartment(id)) {
    try {
      const departmentFiles = await models.file.findOne({
        where: {
          department_id: id
        }
      });

      const departmentUsers = await models.user.findOne({
        where: {
          department_id: id
        }
      });

      if (_.isNull(departmentFiles) && _.isNull(departmentUsers)) {
        return models.field
          .destroy({
            where: {
              department_id: id
            }
          })
          .then(async () => {
            await department.destroy({
              where: { id }
            });
          });
      } else {
        return {
          Err:
            "No es posible borrar departamentos con files y usuarios asociados"
        };
      }
    } catch (error) {
      logger.log({
        level: "error",
        message: `Ha habido un problema al intentar borrar el departamento: ${error.toString()}`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "deleteDepartmentById()",
        request_status: "fail",
        request_data: {
          id
        }
      });

      throw error;
    }
  } else {
    return null;
  }
};

//internal fetch by id
const getDepartmentById = async id => {
  try {
    return await department.findOne({
      where: {
        id
      }
    });
  } catch (error) {
    logger.log({
      level: "warn",
      message: `Ha habido un problema al intentar obtener el departamento: ${error.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "getDepartmentById()",
      request_status: "fail",
      request_data: {
        id
      }
    });

    return error;
  }
};

//return departments where client is not deleted.
const getDepartments = () => {
  return department
    .findAll({
      include: [
        {
          model: models.client,
          as: "owner",
          where: {
            deleted: 0
          }
        }
      ]
    })
    .then(deparments => {
      let aux = [];
      deparments.forEach(department => {
        aux.push(department.dataValues);
      });
      return aux;
    });
};

//self-descriptive
const checkExistantDepartment = async id => {
  const data = await module.exports.getDepartmentById(id);
  return !_.isUndefined(data) && _.isNull(data) ? false : true;
};

module.exports = {
  getDepartment,
  getDepartments,
  createDepartment,
  deleteDepartmentById,
  getDepartmentById
};
