"use strict";
const _ = require("lodash");

const ClientService = require("../service/client.service");
const NextCloudService = require("../service/nextcloud.service");
const messaggeHelper = require("../helpers/message.helper");
const controllerHelper = require("../helpers/controller.helper");
const { msg } = require("../helpers/constants.helper");

const MODULE_NAME = "[Client Controller]";

const getClients = async (req, res) => {
  try {
    const params = {
      cifnif: req.swagger.params.cifnif.value,
      sort: req.swagger.params.sort.value
    };

    const data = await ClientService.getClients(params);
    res.status(200).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getClients.name,
      error,
      res
    );
  }
};

const getClientById = async (req, res) => {
  try {
    const params = {
      id: req.swagger.params.id.value,
      fields: req.swagger.params.fields.value
    };
    const data = await ClientService.getClientById(params);

    if (!_.isNull(data)) {
      const Avatar = await ClientService.getAvatar(data.dataValues.avatar);

      data.dataValues.avatar = Avatar;
    }

    res.status(200).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getClientById.name,
      error,
      res
    );
  }
};

const createClient = async (req, res) => {
  try {
    const params = {
      ...req.body
    };

    //Create client
    const data = await ClientService.createApiClient(params);

    //res.send(data);

    //Create group in nextcloud with client id.
    await NextCloudService.createGroup(data.dataValues.id.toString());

    //Create folder for client
    const name = data.dataValues.company
      ? `${data.dataValues.id.toString()}_${data.dataValues.company}`
      : `${data.dataValues.id.toString()}_${data.dataValues.name}`;
    await NextCloudService.createClientDirectory(name);

    //Assign group
    await NextCloudService.assignGroup(name, data.dataValues.id.toString());

    const saveAvatarData = {
      id: data.dataValues.id,
      folder: name,
      avatar: params.avatar
    };

    const url = await ClientService.saveAvatar(saveAvatarData);
    data.avatar = url;

    res.status(201).send(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      createClient.name,
      error,
      res
    );
  }
};

const updateClientById = async (req, res) => {
  try {
    console.log("this should be.... here");
    const params = {
      id: req.swagger.params.id.value,
      ...req.body
    };
    await ClientService.updateClientById(params);

    res.status(201).send(msg.CL_CT_CLIENT_UPDATED_SUCCESFULLY);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      updateClientById.name,
      error,
      res
    );
  }
};

const deactivateClientById = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    await ClientService.deactivateClientById(id);

    res.status(200).send(msg.CL_CT_CLIENT_DELETED_SUCCESFULLY);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      deactivateClientById.name,
      error,
      res
    );
  }
};

const getClientCustomization = async (req, res) => {
  try {
    const id = req.swagger.params.id.value;
    const data = await ClientService.getClientCustomization(id);

    res.status(200).send(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getClientCustomization.name,
      error,
      res
    );
  }
};

const CheckEmailRepetition = async (req, res) => {
  try {
    console.log(req.swagger.params.email.value);

    const params = req.swagger.params.email.value;
    const data = await ClientService.CheckEmailRepetition(params);

    res.status(200).send(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getClientCustomization.name,
      error,
      res
    );
  }
};

module.exports = {
  getClients,
  getClientById,
  updateClientById,
  createClient,
  deactivateClientById,
  getClientCustomization,
  CheckEmailRepetition
};
