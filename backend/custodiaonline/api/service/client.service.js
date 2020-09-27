const Sequelize = require("sequelize");
const _ = require("lodash");
const models = require("../models");
const client = models.client;
const { err } = require("../helpers/constants.helper");
const depService = require("./department.service");
const fieldService = require("./field.service");
const tokenService = require("./token.service");
const userService = require("./user.service");
const bcrypt = require("bcryptjs");
const logger = require("../../config/logger");
var md5 = require("md5");

const axios = require("axios");
const { api_user, api_password, baseURLapi } = require("../../config/dbConfig");

const { createClient } = require("webdav");

var Mailchimp = require("mailchimp-api-v3");

var moment = require("moment");
moment().format();

const filterAllClients = async params => {
  const Op = Sequelize.Op;
  let filter = {};
  // var rePattern = `/(^${params.cifnif})\\w*/i`;
  filter.deleted = {
    [Op.eq]: 0
  };

  if (!_.isNull(params.cifnif) && !_.isUndefined(params.cifnif)) {
    filter.cifnif = {
      [Op.startsWith]: params.cifnif
    };
  }

  return filter;
};

const authenticateClient = async params => {
  const { email, password } = params;

  const selectedClient = await client.findOne({ where: { email } });

  if (selectedClient) {
    const token = bcrypt
      .compare(password, selectedClient.password)
      .then((same, err) => {
        if (same) {
          const role = ["client"];
          const response = {
            token: tokenService.generateToken(email, role),
            type: role,
            id: selectedClient.id,
            email: selectedClient.email
          };

          logger.log({
            level: "info",
            message: `Cliente ${selectedClient.email} ha accedido a la aplicación`,
            timestamp: moment()
          });
          return response;
        } else {
          throw new Error("Email o contraseña incorrecta");
        }
      });
    return token;
  } else {
    try {
      return await userService.authenticateUser(params);
    } catch (e) {
      logger.log({
        level: "error",
        message: `Ha habido un problema al intentar autenticar cliente: ${e}`,
        user_role: "client",
        user_id: null,
        timestamp: moment(),
        request: "authenticateClient() - [client.service]",
        request_status: "fail",
        request_data: {
          email
        }
      });

      throw e;
    }
  }
};

const recoverPasswordClient = async params => {
  const { email } = params;

  const selectedClient = await client.findOne({ where: { email } });
  let password = createRandomString(8);
  let plainPassword = password; //This is the password that gets sent in the email

  if (selectedClient) {
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

    await models.client.update(
      {
        password
      },
      {
        where: { id: selectedClient.id }
      }
    );

    await sendPasswordEmail(email, plainPassword);

    return "La recuperación de contraseña del cliente ha sido exitosa";
  } else {
    try {
      return await userService.recoverPasswordUser(email, plainPassword);
    } catch (e) {
      logger.log({
        level: "error",
        message: `Hubo un problema al intentar recuperar el password de un usuario: ${e.toString()}`,
        user_role: "client",
        user_id: null,
        timestamp: moment(),
        request: "recoverPasswordClient()",
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
        user_role: "client",
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
                  message: `El cliente ${email} ha recuperado su contraseña efectivamente`,
                  user_role: "client",
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
                  user_role: "client",
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
            user_role: "client",
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
        user_role: "client",
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

const getClientCustomization = async id => {
  return await client
    .findOne({
      where: {
        id,
        deleted: 0
      }
    })
    .then(async clientData => {
      if (clientData != undefined) {
        const avatar = await getAvatar(clientData.avatar);
        const customizationData = {
          color: clientData.color,
          avatar: avatar
        };

        return customizationData;
      } else {
        return null;
      }
    });
};

const getClients = async params => {
  let filter = await filterAllClients(params);

  return await client
    .findAll({
      attributes: { exclude: ["deleted", "deleted_at", "planId", "password"] },
      include: [
        {
          model: models.user,
          attributes: { exclude: ["client_id", "department_id"] },

          include: [
            {
              model: models.department,
              attributes: { exclude: ["client"] },
              required: true
            }
          ]
        },
        {
          model: models.department,
          attributes: { exclude: ["client"] }
        },
        {
          model: models.plan,
          attributes: { exclude: ["quote"] }
        }
      ],
      where: filter
    })

    .catch(e => {
      logger.log({
        level: "error",
        message: `Ha habido un problema al intentar obtener los clientes`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "getClients()",
        request_status: "fail",
        request_data: {
          email,
          response
        }
      });
      throw `Database error: ${e.message}`;
    });
};

const clientFields = async fields => {
  //check fields that are required.
  //let staticOnes = [...fields];
  if (!_.isUndefined(fields)) {
    let finalToShow = [];
    fields.map(field => {
      finalToShow.push(field);
    });
    return finalToShow;
  }
};

const usershows = client_id => {
  //default
  return { exclude: ["client_id"] };
};
const departmentShows = client => {
  return { exclude: ["client"] };
};

const getClientById = async params => {
  const { id, fields } = params;

  let attributesClients = await clientFields(
    _.trim(fields)
      .replace(/ /g, "")
      .split(",")
  );
  let attributesUser, attributesDepartment;

  if (attributesClients.includes("") == true) {
    //which means its empty, must return all of them
    attributesClients = {
      model: client,
      exclude: ["deleted", "deleted_at", "password"]
    };
  } else {
    attributesClients.map(attribute => {
      if (attribute == "users")
        attributesClients.splice(attributesClients.indexOf(attribute), 1);
      attributesUser = usershows(1);

      if (attribute == "departments")
        attributesClients.splice(attributesClients.indexOf(attribute), 1);
      attributesDepartment = departmentShows(1);
    });
  }

  return await client
    .findOne({
      include: [
        {
          model: models.user,
          attributes: attributesUser,

          include: [
            {
              model: models.department,
              attributes: attributesDepartment,
              required: true
            }
          ]
        },
        {
          model: models.department,
          include: [
            {
              model: models.field
            }
          ]
        },
        {
          model: models.plan,
          attributes: { exclude: ["quote"] }
        }
      ],
      where: {
        id,
        deleted: 0
      },
      attributes: attributesClients
    })
    .catch(e => {
      logger.log({
        level: "error",
        message: `Ha habido un problema al intentar obtener los el cliente y/o sus campos especificados`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "getClientById()",
        request_status: "fail",
        request_data: { id, fields }
      });
      const error = {
        code: 500,
        message: err.CL_CT_ERR_CLIENT_NOT_FOUND,
        description: e
      };
      throw error;
    });
};

const sendCreationMail = async (password, client) => {
  const apiKey = "337b6b3efae8b2d738c1ac3809f792f7-us20";
  const listId = "a12df7b895";
  var mailchimp = new Mailchimp(apiKey);

  mailchimp
    .post("/lists/" + listId + "/members", {
      email_address: client.email,
      status: "subscribed",
      merge_fields: {
        EMAIL: client.email,
        PASSWORD: password,
        FNAME: client.name,
        LNAME: client.last_names
      }
    })
    .then(function(result) {
      //AQUI FALTA LOG
    })
    .catch(function(err) {
      //AQUI FALTA LOG
    });
};

const saveAvatar = async data => {
  const { id, folder, avatar } = data;

  const myfile = new Buffer(avatar, "binary");

  const url = `${baseURLapi}${folder}/base64Avatar.txt`;

  const savedAvatar = axios
    .put(url, myfile, {
      auth: {
        username: api_user,
        password: api_password
      },
      headers: {
        "Content-Type": "application/text",
        "OCS-APIRequest": true
      }
    })
    .then(res => {
      logger.log({
        level: "info",
        message: `Avatar guardado exitosamente`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "saveAvatar()",
        request_status: "201",
        request_data: {}
      });
      return res.config.url;
    })
    .catch(err => {
      logger.log({
        level: "error",
        message: `Fallo al guardar el avatar`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "saveAvatar()",
        request_status: "fail",
        request_data: {
          id,
          folder,
          avatar
        }
      });
      throw err;
    });

  const urlString = JSON.stringify(await savedAvatar).replace(/"/g, "");
  await client.update(
    {
      avatar: urlString
    },
    {
      where: {
        id
      }
    }
  );
  return avatar;
};

const getAvatar = async url => {
  return axios
    .get(url, {
      responseType: "text",
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
      return res.data;
    })
    .catch(error => {
      logger.log({
        level: "error",
        message: `Ha habido un problema al intentar obtener el Avatar, ${error}`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "getAvatar()",
        request_status: "fail",
        request_data: {
          url
        }
      });
      throw error;
    });
};

const createApiClient = async params => {
  try {
    const {
      name,
      last_names,
      email,
      planId,
      cifnif,
      departments,
      company: company_u,
      color
    } = params;

    //space validators for company
    let company = company_u ? company_u.replace(/\s+/g, "") : undefined;

    let password = createRandomString(8); //This is the password that gets sent in the email
    let plainPassword = password; //to send email.
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
      //create client
      const Client = await client.create(
        {
          name,
          last_names,
          email,
          company,
          password,
          planId,
          cifnif,
          color
        },
        { transaction: t }
      );

      await Promise.all(
        departments.map(async department => {
          const Department = models.department
            .create(
              {
                name: department.name,
                client: Client.id
              },
              { transaction: t }
            )
            .then(async createdDepartment => {
              //create model field for each department sent.
              let customfields = department.fields;

              await Promise.all(
                customfields.map(async field => {
                  let { name, type, is_visible, is_required } = field;

                  return models.field.create(
                    {
                      name,
                      type,
                      is_visible,
                      is_required,
                      department_id: createdDepartment.id
                    },
                    {
                      transaction: t
                    }
                  );
                })
              );
            })
            .catch(e => {
              throw `Unable to create department ${e.message}`;
            });
          return Department;
        })
      );
      return Client;
    });
    sendCreationMail(plainPassword, result);
    return result;
  } catch (error) {
    logger.log({
      level: "error",
      message: `Ha habido un problema al intentar crear un cliente ${error}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "createApiClient()",
      request_status: "fail",
      request_data: {
        name,
        last_names,
        email,
        planId,
        cifnif,
        departments,
        company: company_u,
        color
      }
    });
    throw new Error(error);
  }
};

const updateClientById = async params => {
  if (await checkExistantClient(params.id)) {
    console.log("his client exists");
    const { id, departments } = params;

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

    //get how it is recorded.
    const oldData = await models.client.findByPk(id);
    const folderName = oldData.dataValues.company
      ? `${oldData.dataValues.id.toString()}_${oldData.dataValues.company}`
      : `${oldData.dataValues.id.toString()}_${oldData.dataValues.name}`;

    if (finalParams.avatar) {
      const url = baseURLapi.concat(folderName);
      const webdav = createClient(url, {
        username: api_user,
        password: api_password
      });

      //delete previously recorded base64
      await webdav.deleteFile("/base64Avatar.txt");
      //upload new avatar data, keep same url.
      await webdav.putFileContents("base64Avatar.txt", finalParams.avatar);

      delete finalParams.avatar;
    }

    return await models.sequelize.transaction(async t => {
      return client
        .update(
          finalParams,
          {
            where: { id }
          },
          { transaction: t }
        )

        .then(async () => {
          //check for deletion
          let isfound;
          if (!_.isEmpty(departments)) {
            const oldDepa = await models.department.findAll(
              {
                where: {
                  client: id
                }
              },
              { transaction: t }
            );

            oldDepa.map(async registry => {
              isfound = false;

              departments.map(incomingRecord => {
                if (_.isEqual(registry.dataValues.id, incomingRecord.id)) {
                  isfound = true;
                }
              });

              if (!isfound) {
                //remove all fields belonging to that department.
                await models.field.destroy(
                  {
                    where: {
                      department_id: registry.dataValues.id
                    }
                  },
                  { transaction: t }
                );

                return await models.department
                  .destroy(
                    {
                      where: { id: registry.dataValues.id }
                    },
                    { transaction: t }
                  )
                  .catch(err => {
                    throw `Unable to delete department with user(s): ${err}`;
                  });
              }
            });
          }

          //update name and type of fields updated
          const FieldModel = models.field;

          await Promise.all(
            departments.map(department =>
              department.fields
                .filter(field => field.wasUpdated) //filter by the filds that have wasUpdated
                .map(
                  async field =>
                    await FieldModel.update(
                      { ...field },
                      {
                        where: { id: field.id }
                      }
                    )
                )
            )
          );

          //update & create afterwards
          if (departments != undefined) {
            return Promise.all(
              departments.map(async department => {
                //if search by id and find, update the name.
                console.log("antes de foundbyid", department.id);
                const foundByid = await models.department.findOne({
                  where: {
                    id: department.id
                  }
                });
                console.log("foundbyid si funciona", { foundByid });

                if (!_.isNull(foundByid)) {
                  return await models.department
                    .update(
                      {
                        name: department.name
                      },
                      {
                        where: { id: foundByid.id }
                      },
                      { transaction: t }
                    )
                    .then(async () => {
                      //create fields

                      const oldFields = await models.field.findAll(
                        {
                          where: {
                            department_id: department.id
                          }
                        },
                        { transaction: t }
                      );

                      let fields = department.fields;
                      if (!_.isEmpty(fields)) {
                        oldFields.map(async registry => {
                          isfound = false;

                          fields.map(incomingRecord => {
                            if (
                              _.isEqual(
                                registry.dataValues.id,
                                incomingRecord.id
                              )
                            ) {
                              isfound = true;
                            }
                          });

                          if (!isfound) {
                            //remove all fields belonging to that department.

                            return await models.field.destroy(
                              {
                                where: { id: registry.dataValues.id }
                              },
                              { transaction: t }
                            );
                          }
                        });
                      }

                      if (fields != undefined) {
                        return Promise.all(
                          fields.map(async field => {
                            //if search by id and find, update the name.
                            const foundByid = await fieldService.getFieldById(
                              field.id
                            );
                            if (!_.isNull(foundByid)) {
                              return await models.field.update(
                                {
                                  is_required: field.is_required,
                                  is_visible: field.is_visible
                                },
                                {
                                  where: { id: foundByid.id }
                                },
                                { transaction: t }
                              );
                            } else {
                              return await models.field
                                .create(
                                  {
                                    name: field.name,
                                    type: field.type,
                                    department_id: department.id,
                                    is_required: field.is_required,
                                    is_visible: field.is_visible
                                  },
                                  { transaction: t }
                                )
                                .catch(e => {
                                  logger.log({
                                    level: "error",
                                    message: `Ha habido un problema al intentar insertar un nuevo field a un file asociado: ${e.toString()}`,
                                    user_role: "user",
                                    user_id: null,
                                    timestamp: moment(),
                                    request: "updateClientById()",
                                    request_status: "fail",
                                    request_data: {
                                      field,
                                      department
                                    }
                                  });
                                  throw `Unable to insert new field ${e}`;
                                });
                            }
                          })
                        );
                      }
                    })

                    .catch(e => {
                      logger.error(e);
                      logger.log({
                        level: "error",
                        message: `Ha habido un problema al actualizar un departamento existente ${e.toString()}`,
                        user_role: "user",
                        user_id: null,
                        timestamp: moment(),
                        request: "updateClientById()",
                        request_status: "fail",
                        request_data: {
                          department
                        }
                      });
                      throw `could not update existant department: ${e}`;
                    });
                } else {
                  const { fields } = department;
                  return await models.department
                    .create(
                      {
                        name: department.name,
                        client: id
                      },
                      { transaction: t }
                    )
                    .then(department => {
                      return Promise.all(
                        fields.map(async field => {
                          return models.field
                            .create(
                              {
                                name: field.name,
                                type: field.type,
                                department_id: department.id,
                                is_required: field.is_required,
                                is_visible: field.is_visible
                              },
                              { transaction: t }
                            )
                            .catch(e => {
                              logger.log({
                                level: "error",
                                message: `Ha habido un problema al intentar insertar un nuevo field a un file asociado: ${e.toString()}`,
                                user_role: "user",
                                user_id: null,
                                timestamp: moment(),
                                request: "updateClientById()",
                                request_status: "fail",
                                request_data: {
                                  field,
                                  department
                                }
                              });
                              throw `Unable to insert new field ${e}`;
                            });
                        })
                      );
                    })
                    .catch(e => {
                      throw `Unable to insert new department ${e}`;
                    });
                }
              })
            );
          }
          //end loop
        })
        .catch(error => {
          logger.error(error);
          throw new Error(`Unable to update client: ${error.message}`);
        });
    });
  } else {
    console.log("not found by id");

    const newError = {
      code: 404,
      message: err.CL_CT_ERR_CLIENT_UPDATE_NOT_FOUND_BY_ID,
      description: err.GEN_ERR_NOT_FOUND
    };
    throw newError;
  }
};

const checkClientFiles = async id => {
  let clientDepartments = await models.department.findAll({
    where: { client_id: id }
  });

  let clientFiles = [];
  await Promise.all(
    clientDepartments.map(async department => {
      const selectedFile = await models.file.findAll({
        where: { department_id: department.id }
      });

      clientFiles = [...clientFiles, ...selectedFile];
    })
  );

  return clientFiles;
};
const deactivateClientById = async id => {
  if (await checkExistantClient(id)) {
    if ((await checkClientFiles(id)) == "") {
      let model = await client.findByPk(id);
      model.deleted = true;
      model.deleted_at = new Date().toISOString();
      return await model.save().catch(error => {
        throw `error : ${error}`;
      });
    } else {
      const error = {
        code: 404,
        message: err.CL_CT_ERR_CLIENT_DELETE_HAS_FILES,
        description: err.CL_CT_ERR_CLIENT_DELETE_HAS_FILES
      };
      throw error;
    }
  } else {
    const error = {
      code: 404,
      message: err.CL_CT_ERR_CLIENT_DELETE_NOT_FOUND_BY_ID,
      description: err.GEN_ERR_NOT_FOUND
    };
    throw error;
  }
};

//self-descriptive
const checkExistantClient = async id => {
  const params = {};
  params.id = id;
  const clientFoundById = await getClientById(params);
  return !_.isUndefined(clientFoundById) && _.isNull(clientFoundById)
    ? false
    : true;
};

//return not nullable parameters ONLY
const getParamsToUpdate = params => {
  return {
    ...(params.name && { name: params.name }),
    ...(params.last_names && { last_names: params.last_names }),
    ...(params.email && { email: params.email }),
    ...(params.password && { password: params.password }),
    ...(params.planId && { planId: params.planId }),
    ...(params.cifnif && { cifnif: params.cifnif }),
    ...(params.company && { company: params.company }),
    ...(params.color && { color: params.color }),
    ...(params.avatar && { avatar: params.avatar })
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

const CheckEmailRepetition = async params => {
  const { email } = params;
  const admin = await models.admin.findAll({
    where: {
      email: email
    }
  });

  if (admin.length === 0) {
    const client = await models.client.findAll({
      where: {
        email: email
      }
    });

    if (client.length === 0) {
      const user = await models.user.findAll({
        where: {
          email: email
        }
      });

      if (user.length === 0) {
        return true;
      }
    }
  }

  return false;
};

module.exports = {
  getClients,
  getClientById,
  updateClientById,
  createApiClient,
  deactivateClientById,
  authenticateClient,
  getClientCustomization,
  saveAvatar,
  getAvatar,
  recoverPasswordClient,
  CheckEmailRepetition
};
