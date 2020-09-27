const models = require("../models");
const _ = require("lodash");
const { err } = require("../helpers/constants.helper");
const tokenService = require("./token.service");
var Mailchimp = require("mailchimp-api-v3");
const bcrypt = require("bcryptjs");
const logger = require("../../config/logger");
var md5 = require("md5");

var moment = require("moment");
moment().format();

const getAdmins = async () => {
  //use findOne in case of expanded query
  return await models.admin.findAll().catch(e => {
    console.log(e);
    const error = {
      code: 500,
      message: err.AD_CT_ERR_ADMINS_NOT_FOUND,
      description: e
    };
    throw error;
  });
};

const getAdminById = async id => {
  //use findOne in case of expanded query
  return await models.admin.findByPk(id).catch(e => {
    console.log(e);
    const error = {
      code: 500,
      message: err.AD_CT_ERR_ADMIN_NOT_FOUND,
      description: e
    };
    throw error;
  });
};

const authenticateAdmin = async params => {
  const { email, password } = params;

  const selectedAdmin = await models.admin.findOne({ where: { email } });

  if (selectedAdmin) {
    const token = await bcrypt
      .compare(password, selectedAdmin.password)
      .then((same, err) => {
        if (same) {
          const role = ["admin"];
          const response = {
            token: tokenService.generateToken(email, role),
            type: role,
            id: selectedAdmin.id,
            email: selectedAdmin.email
          };
          logger.log({
            level: "info",
            message: `Administrador ${selectedAdmin.email} ha accedido a la aplicación`,
            timestamp: moment()
          });
          return response;
        } else if (err) {
          throw err;
        } else {
          throw new Error("Email o contraseña incorrecta");
        }
      });

    return token;
  } else {
    const e = "Este email no está registrado en el sistema";
    logger.log({
      level: "error",
      message: `Ha habido un problema al intentar autenticar administrador: // ${e} //`,
      user_role: "admin",
      user_id: null,
      timestamp: moment(),
      request: "authenticateAdmin() - [admin.service]",
      request_status: "fail",
      request_data: {
        email
      }
    });

    throw new Error(e);
  }
};

const sendCreationMail = async (password, admin) => {
  const apiKey = "337b6b3efae8b2d738c1ac3809f792f7-us20";
  const listId = "a12df7b895";
  var mailchimp = new Mailchimp(apiKey);

  mailchimp
    .post("/lists/" + listId + "/members", {
      email_address: admin.email,
      status: "subscribed",
      merge_fields: {
        EMAIL: admin.email,
        PASSWORD: password,
        FNAME: admin.name,
        LNAME: admin.last_names
      }
    })
    .then(function(result) {
      logger.log({
        level: "info",
        message: `Se ha enviado el correo de bienvenida a: ${admin.email}`,
        user_role: "admin",
        user_id: admin.id,
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
          admin.email
        }: ${err.toString()}`,
        user_role: "admin",
        user_id: admin.id,
        timestamp: moment(),
        request: "sendCreationMail()",
        request_status: "fail",
        request_data: {}
      });
      throw err;
    });
};

const recoverPasswordAdmin = async (email, generatedPassword) => {
  const selectedAdmin = await models.admin.findOne({ where: { email } });

  if (selectedAdmin) {
    let password = generatedPassword; //This is the password that gets sent in the email

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

    await models.admin.update(
      {
        password
      },
      {
        where: { id: selectedAdmin.id }
      }
    );

    await sendPasswordEmail(email, generatedPassword);

    return "La recuperación de contraseña del administrador ha sido exitosa";
  } else {
    throw new Error(
      "No se ha encontrado ninguna cuenta asociada al email ingresado"
    );
  }
};

const sendPasswordEmail = async (email, password) => {
  const apiKey = "337b6b3efae8b2d738c1ac3809f792f7-us20";
  const listId = "a12df7b895";
  const userMD5 = md5(email.toLowerCase());
  console.log(email);
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
        user_role: "admin",
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
                  message: `El administrador ${email} ha recuperado su contraseña efectivamente`,
                  user_role: "admin",
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
                  user_role: "admin",
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
          setTimeout(deleteCampaing, 20000);
        })
        .catch(e => {
          logger.log({
            level: "error",
            message: `Ha habido un problema al intentar enviar el mail de recuperación de contraseña en Mailchimp: ${e.toString()}`,
            user_role: "admin",
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
        user_role: "admin",
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

const createAdmin = async params => {
  const { email } = params;

  let password = params.password;
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

  const Admin = await models.admin
    .create({
      email,
      password
    })
    .catch(e => {
      console.log(e);
      throw `Unable to create Admin ${e.message}`;
    });

  sendCreationMail(plainPassword, Admin);
  return Admin;
};

const updateAdminById = async params => {
  let { id, email, password } = params;
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

  try {
    return await models.admin.update(
      {
        email,
        password
      },
      { where: { id } }
    );
  } catch (error) {
    const newError = {
      code: 404,
      message: err.AD_CT_ERR_ADMIN_UPDATE_NOT_FOUND_BY_ID,
      description: err.GEN_ERR_NOT_FOUND
    };
    throw newError;
  }
};

const deleteAdminById = async params => {
  const id = params;

  try {
    return await models.admin.destroy({ where: { id } });
  } catch (error) {
    const newError = {
      code: 404,
      message: err.AD_CT_ERR_ADMIN_DELETE_NOT_FOUND_BY_ID,
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
const checkExistantAdmin = async id => {
  const adminFoundById = await module.exports.getAdminById(id);

  return !_.isUndefined(adminFoundById) && _.isNull(adminFoundById)
    ? false
    : true;
};

//return not nullable parameters ONLY
const getParamsToUpdate = params => {
  return {
    ...(params.email && { email: params.email }),
    ...(params.password && { last_names: params.password })
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
  createAdmin,
  authenticateAdmin,
  getAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  recoverPasswordAdmin
};
