const { createClient } = require("webdav");
const webdav = require("webdav");
const axios = require("axios");
var model = require("../models/index");
const {
  api_user,
  api_password,
  baseURLapi,
  baseURLGroups,
  baseURLFileSharing
} = require("../../config/dbConfig");
var moment = require("moment");
moment().format();
const logger = require("../../config/logger");
const createClientDirectory = async directoryName => {
  const client = createClient(baseURLapi, {
    username: api_user,
    password: api_password
  });

  try {
    let resp = await client.createDirectory(directoryName);
    return resp.status;
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar crear el directorio en nextcloud: ${e.toString()}`,
      user_role: "[Client]",
      user_id: null,
      timestamp: moment(),
      request: "createClientDirectory()",
      request_status: e.status,
      request_data: { _username, folderName }
    });
    throw e;
  }
};

const createGroup = async groupName => {
  try {
    const url = baseURLGroups;

    var uname = api_user;
    var pass = api_password;
    const data = { groupid: groupName };

    const resp = await axios.post(url, data, {
      auth: {
        username: uname || req.uname,
        password: pass || req.pass
      },
      headers: {
        "Content-Type": "application/json",
        "OCS-APIRequest": true
      }
    });

    return resp.status;
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar crear un grupo en nextcloud: ${e.toString()}`,
      user_role: "[ADMIN]",
      user_id: null,
      timestamp: moment(),
      request: "createGroup()",
      request_status: e.status,
      request_data: { groupName }
    });
    throw e;
  }
};

const assignGroup = async (path, shareWith) => {
  try {
    const params = {
      path: path, //folder
      shareType: "1",
      shareWith: shareWith, //group
      publicUpload: false,
      permissions: "1"
    };

    const data = { path: params.path };

    let url = `${baseURLFileSharing}
      path=${params.path}&shareType=${params.shareType}&shareWith=${params.shareWith}&publicUpload=${params.publicUpload}&permissions=${params.permissions}`;

    const resp = await axios.post(url, data, {
      auth: {
        username: api_user,
        password: api_password
      },
      headers: {
        "Content-Type": "application/json",
        "OCS-APIRequest": true
      }
    });

    return resp.status;
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar compartir un grupo en nextcloud: ${e.toString()}`,
      user_role: "[ADMIN]",
      user_id: null,
      timestamp: moment(),
      request: "assignGroup()",
      request_status: e.status,
      request_data: { path, shareWith }
    });
    throw e;
  }
};

module.exports = {
  createGroup,
  createClientDirectory,
  assignGroup
};
