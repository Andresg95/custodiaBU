const _ = require("lodash");
const UserService = require("../service/user.service");
const messageHelper = require("../helpers/message.helper");
const controllerHelper = require("../helpers/controller.helper");
const { msg} = require("../helpers/constants.helper");

const MODULE_NAME = "[User Controller]";

const getUserById = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    const data = await UserService.getUserById(id);
        
    res.status(200).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getUserById.name,
      error,
      res
    );
  }
};

const createUser = async (req, res) => {
  try {
    const params = {
      ...req.body
    };

    const data = await UserService.createUser(params);

    
    res.status(201).send(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      createUser.name,
      error,
      res
    );
  }
};

const updateUserById = async (req, res) => {
  try {
    const params = {
      id: req.swagger.params.id.value,
      ...req.body
    };

    await UserService.updateUserById(params);

    res.status(201).send(msg.US_CT_USER_UPDATED_SUCCESFULLY);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      updateUserById.name,
      error,
      res
    );
  }
};
const deleteUserById = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    await UserService.deleteUserById(id);
    res.status(200).send(msg.US_CT_USER_DELETED_SUCCESFULLY);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      deleteUserById.name,
      error,
      res
    );
  }
};

const acceptUserById = async (req, res) => {
  try {
    const params = {
      id: req.swagger.params.id.value,
      ...req.body
    };
    await UserService.acceptUserById(params);

    res.status(200).send(msg.US_CT_USER_ACCEPTED_SUCCESFULLY);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      acceptUserById.name,
      error,
      res
    );
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  acceptUserById
};
