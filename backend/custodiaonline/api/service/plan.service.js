var model = require("../models/index");
var moment = require("moment");
moment().format();
const logger = require("../../config/logger");

var _ = require("lodash");

//createPlan reg in DB
const createPlan = async params => {
  const { description, quote } = params.body;

  try {
    return await model.plan.create({
      description,
      quote
    });
  } catch (error) {
    logger.log({
      level: "warn",
      message: `Hubo un problema al intentar insertar un nuevo plan: ${e.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "createPlan()",
      request_status: "fail",
      request_data: {
        description,
        quote
      }
    });
    throw e;
  }
};

const updatePlanById = async params => {
  const { id, description, quote } = params;

  try {
    return await model.plan.update(
      {
        description,
        quote
      },
      { where: { id } }
    );
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar actualizar un registro de plan: ${e.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "updatePlanById()",
      request_status: "fail",
      request_data: {
        id,
        description,
        quote
      }
    });
    throw e;
  }
};

const deletePlanById = async params => {
  const { id } = params;

  try {
    const selectedClient = await model.client.findAll({
      where: { planId: id }
    });

    const notSoftDeletedClients = selectedClient.filter(
      client => client.deleted != 1
    );

    if (notSoftDeletedClients.length == 0) {
      return await model.plan.destroy({ where: { id } });
    } else {
      throw new Error("Hay clientes activos con este plan");
    }
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar borrar un registro de plan: ${e.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "deletePlanById()",
      request_status: "fail",
      request_data: {
        id
      }
    });
    throw e;
  }
};

const getPlanById = async params => {
  const { id } = params;

  try {
    return await model.plan.findOne({ where: { id } });
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar obtener un plan por Id: ${e.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "getPlanById()",
      request_status: "fail",
      request_data: {
        id
      }
    });
    throw e;
  }
};

const getPlans = async () => {
  try {
    return await model.plan.findAll();
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar obtener todos los planes ${e.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "getPlans()",
      request_status: "fail",
      request_data: {}
    });
    throw e;
  }
};

module.exports = {
  createPlan,
  updatePlanById,
  deletePlanById,
  getPlanById,
  getPlans
};
