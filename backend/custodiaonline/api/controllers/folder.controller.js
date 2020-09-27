"use strict";
const _ = require("lodash");

const folderService = require("../service/folder.service");
const messaggeHelper = require("../helpers/message.helper");
const controllerHelper = require("../helpers/controller.helper");
const { msg } = require("../helpers/constants.helper");

const MODULE_NAME = "[Folder Controller]";

const createFolder = async (req, res) => {
  try {
    const params = {
      ...req.body
    };
    params.username = req.swagger.params.id.value;

    const data = await folderService.createFolder(params);
    res.status(201).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      createFolder.name,
      error,
      res
    );
  }
};

//Incompleto
const createFolderById = async (req, res) => {
  try {
    const params = {
      ...req.body
    };
    params.username = req.swagger.params.id.value;

    const data = await folderService.createFolder(params);
    res.status(201).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      createFolderById.name,
      error,
      res
    );
  }
};

const deleteFolder = async (req, res) => {
  const params = {
    username: req.swagger.params.id.value,
    folder: req.swagger.params.folder.value
  };
  try {
    const data = await folderService.deleteFolder(params);
    res.status(200).json(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      deleteFolder.name,
      error,
      res
    );
  }
};



module.exports = {
  createFolder,
  deleteFolder,
  createFolderById
};
 