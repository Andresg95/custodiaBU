const models = require("../models");
const user = models.user;
const _ = require("lodash");
const { err } = require("../helpers/constants.helper");
const tokenService = require("./token.service");
const adminService = require("./admin.service");
const bcrypt = require("bcryptjs");

var Mailchimp = require("mailchimp-api-v3");
const logger = require("../../config/logger");
var md5 = require("md5");

var moment = require("moment");
moment().format();

const getUserById = async id => {
  return await user
    .findOne({
      attributes: { exclude: ["password"] },
      where: { id: id }
    })

    .catch(e => {
      console.log(e);
      //AQUI FALTA LOG
      const error = {
        code: 500,
        message: err.US_CT_ERR_USER_NOT_FOUND,
        description: e
      };
      throw error;
    });
};

const authenticateUser = async params => {
  const { email, password } = params;

  const selectedUser = await user.findOne({ where: { email } });

  if (selectedUser) {
    const token = await bcrypt
      .compare(password, selectedUser.password)
      .then((same, error) => {
        if (same) {
          if (selectedUser.status == "accepted") {
            const role = ["user"];
            const response = {
              token: tokenService.generateToken(email, role),
              type: role,
              id: selectedUser.id
            };
            logger.log({
              level: "info",
              message: `Usuario ${selectedUser.email} ha accedido a la aplicación`,
              timestamp: moment()
            });
            return response;
          } else {
            //AQUI FALTA LOG
            const newError = {
              code: 404,
              message: err.US_CT_ERR_USER_NOT_ACCEPTED_YET,
              description: err.US_CT_ERR_USER_NOT_ACCEPTED_YET
            };
            throw newError;
          }
        } else if (error) {
          throw error;
        } else {
          throw new Error("Email o contraseña incorrecta");
        }
      });

    return token;
  } else {
    try {
      return await adminService.authenticateAdmin(params);
    } catch (e) {
      logger.log({
        level: "error",
        message: `Ha habido un problema al intentar autenticar usuario: // ${e} //`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "authenticateUser() - [user.service]",
        request_status: "fail",
        request_data: {
          email
        }
      });

      throw e;
    }
  }
};

const recoverPasswordUser = async (email, generatedPassword) => {
  const selectedUser = await user.findOne({ where: { email } });

  if (selectedUser) {
    let password = generatedPassword; //This is the password that gets sent in the email
    let plainPassword = password;

    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });

    password = hashedPassword;

    const user = await models.user.update(
      {
        password
      },
      {
        where: { id: selectedUser.id }
      }
    );

    await sendPasswordEmail(email, generatedPassword);

    return "La recuperación de contraseña del usuario ha sido exitosa";
  } else {
    try {
      return await adminService.recoverPasswordAdmin(email, generatedPassword);
    } catch (e) {
      logger.log({
        level: "error",
        message: `Hubo un problema al intentar recuperar el password de un administrador: ${e.toString()}`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "recoverPasswordUser()",
        request_status: "fail",
        request_data: {
          email
        }
      });
      throw e;
    }
  }
};

const sendPasswordEmail = async (email, password) => {
  const apiKey = "337b6b3efae8b2d738c1ac3809f792f7-us20";
  const listId = "a12df7b895";
  const userMD5 = md5(email.toLowerCase());

  var mailchimp = new Mailchimp(apiKey);

  //Cambiar el password en los merge fields de Mailchimp
  mailchimp
    .put("/lists/" + listId + "/members/" + userMD5, {
      merge_fields: {
        PASSWORD: password
      }
    })
    .catch(e => {
      logger.log({
        level: "error",
        message: `Ha habido un problema cambiando los merge fields de Mailchimp: ${e.toString()}`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "sendPasswordEmail()",
        request_status: "fail",
        request_data: {
          email
        }
      });
      throw e;
    });

  //Crear una campaña nueva para enviar el mail de recuperación de password
  mailchimp
    .post("campaigns", {
      type: "regular",
      recipients: {
        list_id: listId,
        segment_text: "Recuperar contraseña",
        segment_opts: {
          match: "all",
          conditions: [
            {
              condition_type: "TextMerge",
              op: "is",
              field: "EMAIL",
              value: email
            }
          ]
        }
      },

      settings: {
        subject_line: "Recuperar contraseña",
        title: "Recuperar contraseña",
        from_name: "Custodia Online",
        reply_to: "custodiaonline.gestion@gmail.com",
        to_name: "*|EMAIL|*",
        template_id: 62457
      }
    })
    .then(response => {
      mailchimp
        .post("campaigns/" + response.id + "/actions/send")
        .then(() => {
          const deleteCampaing = () => {
            mailchimp
              .delete("campaigns/" + response.id)
              .then(() => {
                logger.log({
                  level: "info",
                  message: `El usuario ${email} ha recuperado su contraseña efectivamente`,
                  user_role: "user",
                  user_id: null,
                  timestamp: moment(),
                  request: "sendPasswordEmail()",
                  request_status: "success",
                  request_data: {
                    email
                  }
                });
              })
              .catch(e => {
                logger.log({
                  level: "error",
                  message: `Ha habido un problema al intentar eliminar la campaña de recuperación de contraseña en Mailchimp: ${e.toString()}`,
                  user_role: "user",
                  user_id: null,
                  timestamp: moment(),
                  request: "sendPasswordEmail()",
                  request_status: "fail",
                  request_data: {
                    email,
                    response
                  }
                });
                throw e;
              });
          };
          setTimeout(deleteCampaing, 10000);
        })
        .catch(e => {
          logger.log({
            level: "error",
            message: `Ha habido un problema al intentar enviar el mail de recuperación de contraseña en Mailchimp: ${e.toString()}`,
            user_role: "user",
            user_id: null,
            timestamp: moment(),
            request: "sendPasswordEmail()",
            request_status: "fail",
            request_data: {
              email,
              response
            }
          });
          throw e;
        });
    })
    .catch(e => {
      logger.log({
        level: "error",
        message: `Ha habido un problema al intentar crear la campaña de recuperación de contraseña en Mailchimp: ${e.toString()}`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "sendPasswordEmail()",
        request_status: "fail",
        request_data: {
          email,
          response
        }
      });
      throw e;
    });
};

const sendCreationMail = async (password, user) => {
  const apiKey = "337b6b3efae8b2d738c1ac3809f792f7-us20";
  const listId = "a12df7b895";
  var mailchimp = new Mailchimp(apiKey);

  mailchimp
    .post("/lists/" + listId + "/members", {
      email_address: user.email,
      status: "subscribed",
      merge_fields: {
        EMAIL: user.email,
        PASSWORD: password,
        FNAME: user.name,
        LNAME: user.last_names
      }
    })
    .then(function(result) {
      logger.log({
        level: "info",
        message: `Se ha enviado el correo de bienvenida a: ${user.email}`,
        user_role: "user",
        user_id: user.id,
        timestamp: moment(),
        request: "sendCreationMail()",
        request_status: "success",
        request_data: {}
      });
    })
    .catch(function(err) {
      logger.log({
        level: "error",
        message: `Ha habido un problema al enviar el correo de bienvenida a ${
          user.email
        }: ${err.toString()}`,
        user_role: "user",
        user_id: user.id,
        timestamp: moment(),
        request: "sendCreationMail()",
        request_status: "fail",
        request_data: {}
      });
      throw err;
    });
};

const createUser = async params => {
  try {
    const {
      name,
      last_names,
      email,
      client_id,
      department_id,
      status,
      cifnif
    } = params;

    let password = createRandomString(8); //This is the password that gets sent in the email
    const plainPassword = password;

    //Generate password and hash it
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });

    password = hashedPassword;

    const result = await models.sequelize.transaction(async t => {
      //create user
      const User = await user.create(
        {
          name,
          last_names,
          email,
          password,
          client_id,
          department_id,
          status,
          cifnif
        },
        { transaction: t }
      );

      return User;
    });
    sendCreationMail(plainPassword, result);
    return result;
  } catch (e) {
    //AQUI FALTA LOG
    throw e;
  }
};

const updateUserById = async params => {
  if (await checkExistantUser(params.id)) {
    const { id } = params;
    delete params.id;

    if (params.password) {
      const saltRounds = 10;
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(params.password, saltRounds, function(err, hash) {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      });

      params.password = hashedPassword;
    }
    const finalParams = await getParamsToUpdate(params);

    return await user
      .update(finalParams, {
        where: { id }
      })
      .catch(e => {
        console.log(e);
        throw `Unable to update user ${e.message}`;
      });
  } else {
    const newError = {
      code: 404,
      message: err.US_CT_ERR_USER_UPDATE_NOT_FOUND_BY_ID,
      description: err.GEN_ERR_NOT_FOUND
    };
    throw newError;
  }
};

const deleteUserById = async id => {
  if (await checkExistantUser(id)) {
    return user
      .destroy({
        where: { id }
      })
      .catch(e => {
        console.log(e);
        throw `Unable to delete user ${e.message}`;
      });
  } else {
    const newError = {
      code: 404,
      message: err.US_CT_ERR_USER_DELETE_NOT_FOUND_BY_ID,
      description: err.GEN_ERR_NOT_FOUND
    };
    throw newError;
  }
};

const acceptUserById = async params => {
  if (await checkExistantUser(params.id)) {
    const { id } = params;

    if (params.accept === true) {
      return await user
        .update(
          { status: "accepted" },
          {
            where: { id }
          }
        )
        .catch(e => {
          console.log(e);
          throw `Error accepting user ${e}`;
        });
    } else {
      const newError = {
        code: 400,
        message: err.GEN_ERR_BAD_BODY,
        description: err.GEN_ERR_NOT_FOUND
      };
      throw `Unable to accept user ${e.message} && ${newError}`;
    }
  } else {
    const newError = {
      code: 404,
      message: err.US_CT_ERR_USER_NOT_FOUND,
      description: err.GEN_ERR_NOT_FOUND
    };
    throw newError;
  }
};

///local functions
////self-descriptive
const checkExistantUser = async id => {
  const userFoundById = await module.exports.getUserById(id);
  //console.log(userFoundById);
  return !_.isUndefined(userFoundById) && _.isNull(userFoundById)
    ? false
    : true;
};

//return not nullable parameters ONLY
const getParamsToUpdate = params => {
  return {
    ...(params.name && { name: params.name }),
    ...(params.last_names && { last_names: params.last_names }),
    ...(params.email && { email: params.email }),
    ...(params.client_id && { client_id: params.client_id }),
    ...(params.department_id && { department_id: params.department_id }),
    ...(params.status && { status: params.status }),
    ...(params.cifnif && { cifnif: params.cifnif }),
    ...(params.password && { password: params.password })
  };
};

///////////////////////////////////////
// USEFUL FUNC,
//////////////////////////////////////

//User first password
const createRandomString = length => {
  var str = "";
  for (
    ;
    str.length < length;
    str += Math.random()
      .toString(36)
      .substr(2)
  );
  return str.substr(0, length);
};

module.exports = {
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  acceptUserById,
  authenticateUser,
  recoverPasswordUser
};
