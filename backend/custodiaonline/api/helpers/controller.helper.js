"use strict";

var _ = require("lodash");
const logger = require("../../config/logger");

////////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function buildErrorLog(err) {
  let errorLog;
  if (_.isUndefined(err)) {
    errorLog = "Error not defined";
  } else if (!_.isUndefined(err.stack)) {
    errorLog = err.stack;
  } else if (!_.isUndefined(err.message)) {
    errorLog = err.message;
  } else {
    errorLog = JSON.stringify(err);
  }
  return errorLog;
}

function buildErrorResponse(nameController, nameMethod, err) {
  let code;
  if (!_.isUndefined(err)) {
    code = err.status || err.code || 500;
    err = err.message || err;
  } else {
    code = 500;
  }

  var jsonResultFailed = {
    ok: false,
    error: {
      code: code,
      message: "Internal Server Error",
      error: err,
      description: `Internal Application Error in ${nameController}:${nameMethod}`
    }
  };
  return jsonResultFailed;
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function handleErrorResponse(controllerName, methodName, err, res) {
  var jsonResultFailed = buildErrorResponse(controllerName, methodName, err);
  let code = err.status || err.code || 500;

  res.status(code).send(jsonResultFailed);
}

// //////////////////////////////////////////////////////////////////////////////
// MODULE EXPORTS
// //////////////////////////////////////////////////////////////////////////////

module.exports = {
  handleErrorResponse,
  // for testing
  buildErrorLog: buildErrorLog,
  buildErrorResponse
};
