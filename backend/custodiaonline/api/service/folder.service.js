const _ = require("lodash");
const models = require("../models");
const { err } = require("../helpers/constants.helper");
const { createClient } = require("webdav");
const logger = require("../../config/logger");
const axios = require("axios");
const { api_user, api_password, baseURLapi } = require("../../config/dbConfig");

const createFolder = async ({ clientid }) => {
  const client = createClient(baseURLapi, {
    username: api_user,
    password: api_password
  });

  const { name, company } = await models.client.findByPk(information.clientid);
  const clientName = company
    ? `${information.client}_${company}`
    : `${information.client}_${name}`;

  const url = `${clientName}/${name}`;

  try {
    let result = await client.createDirectory(url);

    return { folder: result.statusText };
  } catch (e) {
    logger.log({
      level: "warn",
      message: `Hubo un problema al intentar crear un folder para el cliente seleccionado: ${e.toString()}`,
      user_role: "[Client]",
      user_id: null,
      timestamp: moment(),
      request: "createFolder()",
      request_status: e.status,
      request_data: { clientid }
    });

    throw e;
  }
};
const deleteFolder = async ({ username, folder }) => {
  const { name, company } = await models.client.findByPk(username);
  const clientName = company ? `${username}_${company}` : `${username}_${name}`;

  const url = `${baseURLapi}${clientName}/${checkNullfolder(folder)}`;

  return axios
    .delete(url, {
      auth: {
        username: api_user,
        password: api_password
      },
      headers: {
        "Content-Type": "content/json",
        "OCS-APIRequest": true
      }
    })
    .then(res => {
      return { success: "Path succesfully deleted" };
    })
    .catch(e => {
      logger.log({
        level: "warn",
        message: `Hubo un problema al intentar borrar el folder del cliente seleccionado: ${e.toString()}`,
        user_role: "[Client]",
        user_id: null,
        timestamp: moment(),
        request: "deleteFolder()",
        request_status: e.status,
        request_data: { username, folder }
      });

      throw e;
    });
};

const checkNullfolder = folder => {
  return _.isNull(folder) || _.isUndefined(folder) || folder == ""
    ? ""
    : `${folder}/`;
};

module.exports = {
  createFolder,
  deleteFolder
};
