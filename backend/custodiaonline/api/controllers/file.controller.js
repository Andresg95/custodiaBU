"use strict";
const _ = require("lodash");

const fileService = require("../service/file.service");
const controllerHelper = require("../helpers/controller.helper");
const { msg } = require("../helpers/constants.helper");
const models = require("../models");

const MODULE_NAME = "[File Controller]";

//get files uses category
const getFiles = async (req, res) => {
  try {
    let params = {};

    //get not declare filters
    Object.keys(req.query).forEach(key => {
      params[key] = req.query[key];
    });

    //get swagger params
    Object.keys(req.swagger.params).forEach(key => {
      if (req.swagger.params[key].value) {
        params[key] = req.swagger.params[key].value;
      }
    });

    const data = await fileService.getFiles(params);

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

const deleteFile = async (req, res) => {
  try {
    const params = {
      fileid: req.swagger.params.id.value,
      token: req.headers.authorization
    };

    const deleteStatus = await fileService.deleteFile(params);
    if ((await deleteStatus) == 204) {
      res.status(200).send(msg.FL_CT_FILE_DELETED_SUCCESFULLY);
    }
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      deleteFile.name,
      error,
      res
    );
  }
};

const downloadFile = async (req, res) => {
  const params = {
    id: req.swagger.params.id.value
  };

  try {
    const data = await fileService.downloadRaw(params);

    res.status(200).send(data);
  } catch (e) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      downloadFile.name,
      error,
      res
    );
  }
};

const previewFile = async (req, res) => {
  const params = {
    id: req.swagger.params.id.value,
    pageNumber: req.swagger.params.page.value
  };

  try {
    const data = await fileService.previewFile(params);

    res.status(200).send(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      downloadFile.name,
      error,
      res
    );
  }
};

const createFile = async (req, res) => {

  let params = {
    information: JSON.parse(req.swagger.params.information.value),
    file: req.files.files,
    token: req.headers.authorization
  };

  try {
    let data = await fileService.createFile(params);
     let dataEraser = new Promise((resolve, reject)=>{
       if(data){
         res.status(200).send(data)
         resolve("done")
       }else{
         reject(new Error)
       }
     })

     dataEraser.then(res=>{
       req = undefined;
       data = undefined;
     })
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      createFile.name,
      error,
      res
    );
  }
};

const getDepartmentFiles = async (req, res) => {

 let params = {}
   //get not declare filters
   Object.keys(req.query).forEach(key => {
    params[key] = req.query[key];
  });

  //get swagger params
  Object.keys(req.swagger.params).forEach(key => {
    if (req.swagger.params[key].value) {
      params[key] = req.swagger.params[key].value;
    }
  });

  delete params.id;
  params.department_id = req.swagger.params.id.value


  try {
    const data = await fileService.getDepartmentFiles(params);
    res.status(200).send(data);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getDepartmentFiles.name,
      error,
      res
    );
  }
};
module.exports = {
  getFiles,
  downloadFile,
  createFile,
  previewFile,
  deleteFile,
  getDepartmentFiles
};
