const _ = require("lodash");
const AdminService = require("../service/admin.service");
const messageHelper = require("../helpers/message.helper");
const controllerHelper = require("../helpers/controller.helper");
const { msg } = require("../helpers/constants.helper");

const MODULE_NAME = "[Admin Controller]";

const getAdmins = async (req, res) => {
  try {
    const data = await AdminService.getAdmins();
    res.status(200).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getAdmins.name,
      error,
      res
    );
  }
};

const getAdminById = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    const data = await AdminService.getAdminById(id);
    res.status(200).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getAdminById.name,
      error,
      res
    );
  }
};

const createAdmin = async (req, res) => {
  try {
    const params = {
      ...req.body
    };

    const data = await AdminService.createAdmin(params);

    res.status(201).send(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      createAdmin.name,
      error,
      res
    );
  }
};

const updateAdminById = async (req, res) => {
  try {
    const params = {
      id: req.swagger.params.id.value,
      ...req.body
    };

    await AdminService.updateAdminById(params);

    res.status(201).send(msg.AD_CT_ADMIN_UPDATED_SUCCESFULLY);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      updateAdminById.name,
      error,
      res
    );
  }
};

const deleteAdminById = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    await AdminService.deleteAdminById(id);
    res.status(200).send(msg.AD_CT_ADMIN_DELETED_SUCCESFULLY);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      deleteAdminById.name,
      error,
      res
    );
  }
};


module.exports = {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById
};
