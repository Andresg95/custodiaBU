const _ = require("lodash");
const Sequelize = require("sequelize");
const models = require("../models");
const file = models.file;
const { err, msg } = require("../helpers/constants.helper");
const PDF2PIC = require("pdf2pic");
const shell = require("shelljs");

const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { createClient } = require("webdav");
const fieldService = require("./field.service");
const logger = require("../../config/logger");
var moment = require("moment");
moment().format();

const { cleaner } = require("../../nexcloudUploaders/cleaner");

const department = models.department;
const departmentService = require("./department.service");
const clientService = require("./client.service");
const axios = require("axios");
const { api_user, api_password, baseURLapi } = require("../../config/dbConfig");
const pdfjsLib = require("pdfjs-dist");

const _getAll = async params => {

  const Op = Sequelize.Op;

  const paginate = (page, pageSize) => {
    if (page == 0 || !page) {
      page = 1;
    }

    if (pageSize == 0 || !pageSize) {
      pageSize = 10;
    }

    let from = page == 1 ? 0 : page - 1;

    from = from * pageSize;

    const offset = from;
    const limit = pageSize;

    return {
      offset,
      limit
    };
  };

  const getOthersParams = others => {
    let Where = {};
    Object.keys(others).forEach(other => {
      Where[other] = {
        [Op.like]: `%${others[other]}%`
      };
    });
    return Where;
  };

  const createOrder = ({ orderBy, sort }) => {
    let order = [];

    if (orderBy == "department" || orderBy == "client") {
      if (orderBy == "department") {
        order.push([models.department, "id", sort]);
      }
      if (orderBy == "client") {
        order.push([
          models.department,
          { model: models.client, as: "owner" },
          "id",
          sort
        ]);
      }

      // if (orderBy == 'value') {
      //   order.push([{ model: models.field_file_xref }, 'value', sort])
      // }
    } else {
      order.push([orderBy, sort]);
    }
    return order;
  };

  let {
    orderBy,
    sort,
    pageNumber,
    pageSize,
    id,
    role,
    department,
    client
  } = params.protectedParams;

  sort = sort ? sort : "ASC";
  orderBy = orderBy ? orderBy : "id";
  client = client ? client : "";
  department = department ? department : "";

  const objectQuery = {
    include: [
      {
        model: models.department,
        where: {
          name: {
            [Op.like]: `%${department}%`
          }
        },
        include: [
          {
            model: models.client,
            as: "owner",
            where: {
              [Op.or]: [
                {
                  name: {
                    [Op.like]: `%${client}%`
                  }
                },
                {
                  last_names: {
                    [Op.like]: `%${client}%`
                  }
                },
                {
                  company: {
                    [Op.like]: `%${client}%`
                  }
                }
              ],

              deleted: false
            }
          }
        ]
      }
    ],
    where: {
      etag: {
        [Op.not]: null
      },
      ...params.where,
      ...getOthersParams(params.others)
    },
    order: createOrder({ orderBy, sort })
  };

  let data = await models.file.findAll({
    ...objectQuery,
    ...paginate(pageNumber, pageSize)
  });

  const totalCount = await models.file.count({
    ...objectQuery
  });

  data = JSON.parse(JSON.stringify(data));

  return {
    totalCount,
    data: data.map(file => ({
      ...file,
      department: file.department.name,
      client: file.department.owner.company
        ? file.department.owner.company
        : `${file.department.owner.company.name} ${file.department.owner.company.last_names}`
    }))
  };
};

const getFilesClient = async (id, params) => {
  try {
    const clientDepartments = await department.findAll({
      where: {
        client_id: id
      }
    });

    const list = await clientDepartments.map(record => record.dataValues.id);

    let Op = Sequelize.Op;

    let clientParams = {
      ...params,
      where: {
        department_id: {
          [Op.in]: list
        }
      }
    };
    return _getAll(clientParams);
  } catch (e) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar recuperar las files de un cliente: ${e.toString()}`,
      user_role: "client",
      user_id: null,
      timestamp: moment(),
      request: "getFilesClient()",
      request_status: "fail",
      request_data: {
        client_id: id
      }
    });
    throw e;
  }
};

const _filesUser = async params => {
  const Op = Sequelize.Op;

  const paginate = (page, pageSize) => {
    if (page == 0 || !page) {
      page = 1;
    }

    if (pageSize == 0 || !pageSize) {
      pageSize = 10;
    }

    let from = page == 1 ? 0 : page - 1;

    from = from * pageSize;

    const offset = from;
    const limit = pageSize;

    return {
      offset,
      limit
    };
  };

  const getOthersParams = async (others, department) => {
    if (_.isEmpty(others)) {
      return {};
    }

    const othersArr = Object.entries(others);
    const fillArray = new Promise(async (resolve, reject) => {
      let allIds = [];
      for (const [objFilter, objValue] of othersArr) {

        switch (objFilter) {
          case "name":
            let fileids= await models.file.findAll({
              where: {
                name: { [Op.like]: `%${objValue}%` }
              }
            }).then(res =>res.map(file => file.id))
            allIds.push(await fileids)

            break;

          default:

            let Where = {};
            Where["name"] = { [Op.like]: `%${objFilter}%` };

            let innerWhere = {};
            innerWhere.value = { [Op.like]: `%${objValue}%` };

            //fields ids
            let FieldsId = await models.field
              .findAll({
                where: { ...Where, department_id: department }
              }).then(async fields => fields.map(field => field.id));

            //actuall xrefs 
            let XrefFilesIds = await models.field_file_xref
              .findAll({
                attributes: { exclude: ["id"] },
                where: {
                  field_id: {
                    [Op.like]: await FieldsId
                  },
                  ...innerWhere
                }
              })
              .then(data => {
                let index = data.map(xref => xref.file_id);
                return index;
              })
              .catch(e => "no files name match");
            allIds.push(await XrefFilesIds);
            break;
        }
      };
      resolve(allIds)

    })

    return fillArray.then((res) => {
      let finalIDs = [];
      const repeat = Object.keys(res).length;
      let flatres = _.flatten(res).sort();
      //element must be repeated  {$repeat} times to be added to final array

      //construct object to know amount of repeated values
      var counts = {};
      flatres.map(x => { if (typeof (counts[x]) == "undefined") counts[x] = 0; counts[x]++; });
      const loopable = Object.entries(counts);
      for (const [fileID, count] of loopable) {
        if (count === repeat)
          finalIDs.push(fileID);
      }

      return {
        id: {
          [Op.in]: _.values(finalIDs)
        }
      }
    })
  };

  let { pageNumber, pageSize, department, client } = params.protectedParams;

  _sort = "ASC";
  _orderBy = "id";
  client = client ? client : "";
  department = department ? department : "";

  const objectQuery = {
    include: [
      {
        model: models.department,
        where: {
          name: {
            [Op.like]: `%${department}%`
          }
        },
        include: [
          {
            model: models.client,
            as: "owner",
            where: {
              [Op.or]: [
                {
                  name: {
                    [Op.like]: `%${client}%`
                  }
                },
                {
                  last_names: {
                    [Op.like]: `%${client}%`
                  }
                },
                {
                  company: {
                    [Op.like]: `%${client}%`
                  }
                }
              ],

              deleted: false
            }
          }
        ]
      }
    ],
    where: {
      etag: {
        [Op.not]: null
      },
      ...params.where,
      ...(await getOthersParams(params.others, params.where.department_id))
    },
    order: [[_orderBy, _sort]]
  };

  let data = await models.file.findAll({
    ...objectQuery,
    ...paginate(pageNumber, pageSize)
  });

  const totalCount = await models.file.count({
    ...objectQuery
  });

  data = JSON.parse(JSON.stringify(data));

  return {
    totalCount,
    data: data.map(file => ({
      ...file,
      department: file.department.name,
      client: file.department.owner.company
        ? file.department.owner.company
        : `${file.department.owner.company.name} ${file.department.owner.company.last_names}`
    }))
  };
};

const getFilesUser = async (id, params) => {
  //files included by department..

  try {
    let { orderBy, sort } = params.protectedParams;

    const mydepartment = await models.user.findByPk(id);
    const newParams = {
      ...params,
      where: {
        department_id: mydepartment.department_id
      }
    }

    const data = await _filesUser(newParams);
    const filesIds = data.data.map(file => file.id);
    //async copy for easier manipulation.
    let Op = Sequelize.Op;

    const xrefFields = await models.field_file_xref.findAll({
      attributes: {
        exclude: ["id"]
      },
      where: {
        file_id: {
          [Op.in]: filesIds
        },
        value: {
          [Op.ne]: ""
        }
      },
      order: [["value", "DESC"]]
    });

    const fields = await models.field.findAll({
      where: {
        id: {
          [Op.in]: xrefFields.map(xrefField => xrefField.field_id)
        },

        is_visible: true
      }
    });

    let dataValues = data.data.map(file => {
      let obj = {
        ...file
      };

      fields.map(field => {
        const value = xrefFields.find(xrefField => {
          if (xrefField.field_id == field.id && xrefField.file_id == file.id) {
            return xrefField.dataValues.value;
          }
        })
          ? xrefFields.find(xrefField => {
            if (
              xrefField.field_id == field.id &&
              xrefField.file_id == file.id
            ) {
              return xrefField.dataValues.value;
            }
          }).dataValues.value
          : "";

        obj = {
          ...obj,
          [field.name]: value
        };
      });

      return obj;
    });

    //order dataValues
    if (orderBy != "name") {
      let aux = [];
      dataValues.forEach(ele => {
        aux.push(ele);
      });
      sort == "asc"
        ? aux.sort((a, b) =>
          a.orderBy > b.orderBy
            ? 1
            : a.orderBy === b.orderBy
              ? a.name > b.name
                ? 1
                : -1
              : -1
        )
        : aux.sort((a, b) =>
          a.orderBy < b.orderBy
            ? 1
            : a.orderBy === b.orderBy
              ? a.name < b.name
                ? 1
                : -1
              : -1
        );

      return {
        ...data,
        data: aux
      };
    }

    return {
      ...data,
      data: dataValues
    };
  } catch (error) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar recuperar las files de un usuario: ${error.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "getFilesUser()",
      request_status: "fail",
      request_data: {
        user_id: id
      }
    });
    throw error;
  }
};

const getFilesAdmin = async params => {
  try {
    return await _getAll(params);
  } catch (e) {
    //getFilesAdmin

    logger.log({
      level: "error",
      message: `Hubo un problema al intentar recuperar las files de un admin: ${e.toString()}`,
      user_role: "admin",
      user_id: null,
      timestamp: moment(),
      request: "getFilesUser()",
      request_status: "fail",
      request_data: {}
    });
  }
};

const getFiles = async params => {
  const { id, role } = params;

  const parseParams = returnProtectedParams(params);

  switch (role) {
    case "admin":
      return await getFilesAdmin(parseParams);

    case "client":
      return await getFilesClient(id, parseParams);

    case "user":
      return await getFilesUser(id, parseParams);

    default:
      let errorRole = "Error en la seleccion de roles";
      //AQUI FALTA LOG
      throw errorRoles;
  }
};

const filterFiles = async params => {
  //clientid, dateTo

  const { data, clientId, dateFrom, dateTo } = params;
  delete params.data;

  const specialFilter = {
    clientId,
    dateFrom,
    dateTo
  };
  //1-fully matchable fields
  let directFilters = getDirectParamsToFilter(params);
  //direct file filters....
  let basicfiltered = _.filter(data, directFilters);
  let result = basicfiltered;

  //2-special filters applied...
  const specialFilters = await getSpecialParamsToFilter(specialFilter);

  /*bd queries for file matching */
  /*create object for matching */
  let dataToFilter = {
    data: result,
    clientId: specialFilters.client_id
  };

  let dates = {
    from: specialFilters.dateFrom,
    to: specialFilters.dateTo,
    data: result
  };

  const fileClient = await filterClient(dataToFilter);
  const finalFileClient = await fileClient;
  const finalDate = filterDate(dates);

  let clientFiltered, dateFiltered;

  //client filter
  if (!_.isNull(finalFileClient)) {
    clientFiltered = _.intersectionWith(
      finalFileClient,
      basicfiltered,
      _.isEqual
    );
    result = clientFiltered;
  }

  //dateFiltered
  if (!_.isNull(finalDate)) {
    if (!_.isUndefined(clientFiltered)) {
      dateFiltered = _.intersectionWith(finalDate, clientFiltered, _.isEqual);
      result = dateFiltered;
    } else {
      dateFiltered = _.intersectionWith(finalDate, basicfiltered, _.isEqual);
      result = dateFiltered;
    }
  }
  //3-constains (name)
  if (!_.isUndefined(params.name)) {
    let NameFilter = [];
    result.forEach(file => {
      if (_.startsWith(file.name, params.name)) NameFilter.push(file);
    });
    return NameFilter;
  }
  return result;
};

const filterClient = async params => {
  //check for nullable field
  return !_.isUndefined(params.clientId)
    ? await getAllFilesForClient(params)
    : null;
};

const filterDate = params => {
  const { to, from } = params;
  if (_.isUndefined(to) && _.isUndefined(from)) {
    return null;
  } else {
    if (_.isUndefined(to)) {
      params.to = moment(new Date());
    }
    if (_.isUndefined(from)) {
      //arbitrary start date, ig 2010
      params.from = moment("1970-01-01").format("YYYY-MM-DD");
    }
  }
  return compareDatesForFiles(params);
};

const compareDatesForFiles = params => {
  const { to, from, data } = params;
  let fromDateResults = [];
  let toDateResults = [];

  //make moment objects
  let formatedFrom = moment(from);
  let formatedTo = moment(to);

  //remove timepart
  formatedFrom = formatedFrom.format().split("T")[0];
  formatedTo = formatedTo.format().split("T")[0];

  //loop before date
  data.forEach(record => {
    if (moment(record.creation_date).isSameOrAfter(formatedFrom, "day")) {
      fromDateResults.push(record);
    }
  });

  //loop after date
  fromDateResults.forEach(record => {
    if (moment(record.creation_date).isSameOrBefore(formatedTo, "day")) {
      toDateResults.push(record);
    }
  });

  return toDateResults;
};

const getAllFilesForClient = async params => {
  const { clientId: client, data } = params;
  try {
    //search depa, then files for those departments.
    const clientDepartments = department
      .findAll({
        where: { client }
      })
      .then(departments => {
        let aux = [];
        departments.forEach(department => {
          aux.push(department.dataValues.id);
        });
        return aux;
      })
      .catch(e => {
        //AQUI FALTA LOG
        throw e;
      });
    //create duplicate for easier manipulation

    const listedDepartments = await clientDepartments;
    let departlist = data.filter(item => {
      return listedDepartments.indexOf(item.department_id) > -1;
    });
    return departlist;
  } catch (error) {
    //AQUI FALTA LOG
    throw error;
  }
};

//ISBEFORE && ISAFTER moment js
const getDirectParamsToFilter = params => {
  return {
    ...(params.departmentId && { department_id: params.departmentId }),
    ...(params.extension && { extension: params.extension })
  };
};

const getSpecialParamsToFilter = params => {
  //    clientId, dateFrom, dateTo
  return {
    ...(params.clientId && { client_id: params.clientId }),
    ...(params.dateFrom && { dateFrom: params.dateFrom }),
    ...(params.dateTo && { dateTo: params.dateTo })
  };
};

const downloadRaw = async params => {
  const { id } = params;

  const selectedFile = await models.file.findOne({
    where: { id: id }
  });

  const selectedDepartment = await models.department.findOne({
    where: { id: selectedFile.department_id }
  });

  const { name, company } = await models.client.findByPk(
    selectedDepartment.client
  );
  const clientName = company
    ? `${selectedDepartment.client}_${company}`
    : `${selectedDepartment.client}_${name}`;

  const url = `${baseURLapi}/${clientName}/${selectedFile.name}.${selectedFile.extension}`;

  return axios
    .get(url, {
      responseType: "arraybuffer",
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
      return new Buffer(res.data, "binary").toString("base64");
    })
    .catch(error => {
      logger.log({
        level: "warn",
        message: `Hubo un problema al intentar recuperar los datos de flujo de bits: ${error.toString()}`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "downloadRaw()",
        request_status: "fail",
        request_data: {
          id
        }
      });
    });
};

const previewFile = async params => {
  const { id, pageNumber } = params;
  let url;

  const selectedFile = await models.file.findOne({
    where: { id: id }
  });

  const selectedDepartment = await models.department.findOne({
    where: { id: selectedFile.department_id }
  });

  const { name, company } = await models.client.findByPk(
    selectedDepartment.client
  );
  const clientName = company
    ? `${selectedDepartment.client}_${company}`
    : `${selectedDepartment.client}_${name}`;

  url = `${baseURLapi}${clientName}/`;
  let parsedfilename = selectedFile.name.replace(/\s+/g, "%20");

  let finalurl = url.concat(`${parsedfilename}.${selectedFile.extension}`);

  const download = axios
    .get(finalurl, {
      responseType: "arraybuffer",
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
      return selectedFile.extension.toLowerCase() == "pdf"
        ? new Buffer(res.data, "binary")
        : new Buffer(res.data, "binary").toString("base64");
    })
    .catch(err => {
      //AQUI FALTA LOG
    });

  if (selectedFile.extension.toLowerCase() == "pdf") {
    //buffered reader for node pdf file.
    const path = `${__dirname}/../tempfile/temporary.pdf`;
    fs.writeFileSync(path, new Buffer(await download, "binary"), err => {
      if (err) {
        logger.log({
          level: "error",
          message: `No se puede escribir el fichero por:   ${err}`
        });
      }
    });

    //  wrote in tempfiles..
    const pdf2pic = new PDF2PIC({
      density: 100,
      savename: "untitled",
      savedir: `${__dirname}/../tempfile/`,
      format: "jpg",
      size: 600
    });

    const decoder = await pdf2pic
      .convertToBase64(
        `${__dirname}/../tempfile/temporary.pdf`,
        pageNumber || 1
      )
      .then(resolve => {
        if (resolve.base64) {
          logger.log({
            level: "info",
            message: `Imagen convertida con exito`
          });
          return resolve.base64;
        } else {
          logger.log({
            level: "error",
            message: `Imagen no legible`
          });
        }
      })
      .catch(error => {
        logger.log({
          level: "warn",
          message: `Hubo un problema al intentar decodificar la imagen: ${error.toString()}`,
          user_role: "user",
          user_id: null,
          timestamp: moment(),
          request: "previewFile()",
          request_status: "fail",
          request_data: {}
        });

        throw error;
      });
    //return in case of pdf

    var numPages;
    await pdfjsLib
      .getDocument(`${__dirname}/../tempfile/temporary.pdf`)
      .then(function (doc) {
        numPages = doc.numPages;
      });

    var decorderObj = {
      totalCount: numPages,
      data: decoder,
      pageNumber
    };
    return decorderObj;
  }
  //in case of jpg/png/anything else.

  var decorderObj = {
    totalCount: 1,
    data: await download,
    pageNumber: 1
  };

  return decorderObj;
};

const deleteFile = async params => {
  
  const { fileid, token  } = params;
  let RawtokenData =token.split("Bearer ")[1];
  let Tokendata = jwt.decode(RawtokenData)

  try {
    const selectedFile = await file.findOne({
      where: { id: fileid }
    });

    const selectedDepartment = await models.department.findByPk(
      selectedFile.dataValues.department_id
    );

    const { id: clientId } = await models.client.findByPk(
      selectedDepartment.dataValues.client
    );

    const { name, company } = await models.client.findByPk(clientId);
    const clientName = company
      ? `${clientId}_${company}`
      : `${clientId}_${name}`;

    const url = baseURLapi.concat(clientName);

    const client = createClient(url, {
      username: api_user,
      password: api_password
    });

    return client
      .deleteFile(`/${selectedFile.name}.${selectedFile.extension}`)
      .then(async response => {
        await models.field_file_xref.destroy({
          where: {
            file_id: fileid
          }
        });

        await file.destroy({
          where: {
            id: fileid
          }
        });

        logger.log({
          level: "info",
          timestamp: moment(),
          deletedBy: Tokendata.email,
          message: `Se ha borrado correctamente el fichero ${selectedFile.name}.${selectedFile.extension}`
        })

        return response.status;
      })
      .catch(er => {
        logger.log({
          level: "error",
          message: `Hubo un problema al intentar borrar el archivo en NC: ${er.toString()}`,
          user_role: "user",
          user_id: null,
          timestamp: moment(),
          request: "deleteFile()",
          request_status: "fail",
          request_data: { fileid }
        });

        throw er;
      });
  } catch (error) {
    logger.log({
      level: "error",
      message: `Cliente no encontrado: ${error}`
    });
    throw error;
  }
};

const createFile = async params => {
  //INSERT FILE DATA IN DB.

  let {token } = params;
  let RawtokenData =token.split("Bearer ")[1];
  let Tokendata = jwt.decode(RawtokenData)


  let { department_id, values } = params.information;

  let fileData;
  switch (params.file.mimetype) {
    case "application/pdf":
      fileData = await pdfToServer(params);
      break;
    case "text/plain":
      fileData = await txtToServer(params);
      break;
    case "image/jpeg":
      fileData = await imageToServer(params);
      break;
    case "image/png":
      fileData = await pngToServer(params);
      break;
    case "application/octet-stream":
      let ext = params.file.originalname.substr(
        params.file.originalname.lastIndexOf(".") + 1
      );

      if (ext == "doc" || ext == "docx") {
        fileData = await docToServer(params);
      }
      break;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      fileData = await docxToServer(params);
      break;
    default:
      let extensionError = "No extension match supported";

      logger.log({
        level: "warn",
        message: `Extension solicitada no disponible aún.`,
        user_role: "user",
        user_id: null,
        timestamp: moment(),
        request: "deleteFile()",
        request_status: "fail",
        request_data: { fileid }
      });

      throw extensionError;
  }

  try {
    //save to bd
    if ((await fileData) && (await fileData.repeatead)) {
      throw "Ya existe un fichero con ese nombre.  Cámbialo y reintenta";
    }

    if (await (fileData.status == 201 || fileData.status == 204)) {
      let deconName = path.parse(params.file.originalname);

      let fields = await fieldService.getFieldsByDepartments(department_id);

      return await models.sequelize
        .transaction(async t => {
          return file
            .create(
              {
                name: deconName.name,
                creation_date: moment().format("YYYY-MM-DD"),
                extension: deconName.ext.split(".").join(""),
                url:
                  (await fileData.config.url) ||
                  `${baseURLapi}${params.information.client}/${deconName.base}`,
                etag: parseEtag(fileData.headers.etag),
                department_id
              },
              { transaction: t }
            )
            .then(
              data => {
                logger.log({
                  level: "info",
                  message: msg.FL_CT_FILE_CREATED_SUCCESFULLY
                });
                fileData = undefined;
                //loop through fields
                fields.forEach(field => {
                  //same for each value in values
                  Object.keys(values).forEach(key => {
                    if (_.isEqual(field.name, key)) {
                      return models.field_file_xref
                        .create(
                          {
                            file_id: data.dataValues.id,
                            field_id: field.id,
                            value: values[key]
                          },
                          { transaction: t }
                        )
                        .then(res => {
                          logger.log({
                            level: "info",
                            message: `Insertado en field_file_xref con éxito campo: ${field.id} valor: ${values[key]}`
                          });
                          return res;
                        })
                        .catch(e => {
                          logger.log({
                            level: "error",
                            message: `No se pudo insertar en field_file_xref: ${e}`
                          });
                        });
                    }
                  });
                });

                logger.log({
                  level: "info",
                  timestamp: moment(),
                  message: `Insertado el fichero ${deconName}`,
                  uploadedBy: Tokendata.email
                });
                return data;
              },
              { transaction: t }
            )
            .catch(e => {
              logger.log({
                level: "error",
                message: `Error guardando departamento: ${e}`
              });
              throw e;
            });
        })
        .catch(async () => {
          return file
            .create(
              {
                name: deconName.name,
                creation_date: moment().format("YYYY-MM-DD"),
                extension: deconName.ext.split(".").join(""),
                url:
                  (await fileData.config.url) ||
                  `${baseURLapi}${params.information.client}/${deconName.base}`,
                etag: parseEtag(fileData.headers.etag),
                department_id
              },
              { transaction: t }
            )
            .then(
              data => {
                logger.log({
                  level: "info",
                  message: msg.FL_CT_FILE_CREATED_SUCCESFULLY
                });

                fileData = undefined;
                //loop through fields
                fields.forEach(field => {
                  //same for each value in values
                  Object.keys(values).forEach(key => {
                    if (_.isEqual(field.name, key)) {
                      return models.field_file_xref
                        .create(
                          {
                            file_id: data.dataValues.id,
                            field_id: field.id,
                            value: values[key]
                          },
                          { transaction: t }
                        )
                        .then(res => {
                          logger.log({
                            level: "info",
                            timestamp: moment(),
                            uploadedBy: Tokendata.email,
                            message: `Insertado en field_file_xref con éxito campo: ${field.id} valor: ${values[key]}`
                          });
                          return res;
                        })
                        .catch(e => {
                          logger.log({
                            level: "error",
                            message: `No se pudo insertar en field_file_xref: ${e}`
                          });
                        });
                    }
                  });
                });

                logger.log({
                  level: "info",
                  timestamp: moment(),
                  message: `Insertado el fichero ${deconName}`,
                  uploadedBy: Tokendata.email
                });

                return data;
              },
              { transaction: t }
            )
            .catch(e => {
              logger.log({
                level: "error",
                message: `Error guardando departamento: ${e}`
              });
              throw e;
            });
        });
      //});
    }
  } catch (er) {
    //reboot the server?
    logger.log({
      level: "error",
      message: `Hubo un error al intentar guardar el archivo, ${er.toString()}`,
      user_role: "user",
      user_id: null,
      timestamp: moment(),
      request: "createFile()",
      request_status: "fail",
      request_data: { department_id, values }
    });

    throw er;
  }
};

const parseEtag = etag => {
  //remove quotes from etag
  etag.toString();
  etag = etag.replace(/"/g, "");
  return etag;
};

const checkNullfolder = folder => {
  return _.isNull(folder) || _.isUndefined(folder) || folder == ""
    ? ""
    : `${folder}/`;
};

const pdfToServer = async ({ information, file }) => {
  const { name, company } = await models.client.findByPk(information.client);

  const clientName = company
    ? `${information.client}_${company}`
    : `${information.client}_${name}`;

  let baseroot = clientName;
  let directory = path.join(__dirname, "/../tempfile/files", baseroot);
  shell.mkdir(path.join(__dirname, "/../tempfile/files"));
  shell.mkdir(directory);
  const sourcedir = path.join(directory, file.originalname);

  fs.writeFileSync(sourcedir, file.buffer, "utf8", err => {
    if (err) {
      console.log("WRITE: " + err);
    }
  });

  //execute manual script for node
  let uploadPromise = new Promise(async (resolve, reject) => {
    try {
      shell.cd(path.join(__dirname, "./../../nexcloudUploaders/pdf"));
      let microservice = shell.exec(
        path.join(__dirname, "./../../nexcloudUploaders/pdf/upload.sh")
      );
      if (microservice) {
        resolve("done");
      }
    } catch (error) {
      reject(error);
    }
  });

  return await uploadPromise
    .then(async res => {
      let obj = fs.readFileSync(
        path.join(directory, `${file.originalname}.json`),
        "utf-8"
      );
      //borrar de disco los ficheros y carpeta de ser posible.
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
      return JSON.parse(obj);
    })
    .catch(err => {
      logger.log({
        level: "error",
        message: `Error guardando fichero: ${err}`
      });
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
    });
};

const txtToServer = async ({ information, file }) => {
  const { name, company } = await models.client.findByPk(information.client);
  const clientName = company
    ? `${information.client}_${company}`
    : `${information.client}_${name}`;

  let baseroot = clientName;
  let directory = path.join(__dirname, "/../tempfile/files", baseroot);
  shell.mkdir(path.join(__dirname, "/../tempfile/files"));
  shell.mkdir(directory);
  const sourcedir = path.join(directory, file.originalname);

  fs.writeFileSync(sourcedir, file.buffer, "utf8", err => {
    if (err) {
      console.log("WRITE: " + err);
    }
  });

  //execute manual script for node
  let uploadPromise = new Promise(async (resolve, reject) => {
    try {
      shell.cd(path.join(__dirname, "./../../nexcloudUploaders/txt"));
      let microservice = shell.exec(
        path.join(__dirname, "./../../nexcloudUploaders/txt/upload.sh")
      );
      if (microservice) {
        resolve("done");
      }
    } catch (error) {
      reject(error);
    }
  });

  return await uploadPromise
    .then(async res => {
      let obj = fs.readFileSync(
        path.join(directory, `${file.originalname}.json`),
        "utf-8"
      );
      //borrar de disco los ficheros y carpeta de ser posible.
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
      return JSON.parse(obj);
    })
    .catch(err => {
      console.log(err);
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
    });
};

const imageToServer = async ({ information, file }) => {
  const { name, company } = await models.client.findByPk(information.client);
  const clientName = company
    ? `${information.client}_${company}`
    : `${information.client}_${name}`;

  let baseroot = clientName;
  let directory = path.join(__dirname, "/../tempfile/files", baseroot);
  shell.mkdir(path.join(__dirname, "/../tempfile/files"));
  shell.mkdir(directory);
  const sourcedir = path.join(directory, file.originalname);

  fs.writeFileSync(sourcedir, file.buffer, "utf8", err => {
    if (err) {
      console.log("WRITE: " + err);
    }
  });

  //execute manual script for node
  let uploadPromise = new Promise(async (resolve, reject) => {
    try {
      shell.cd(path.join(__dirname, "./../../nexcloudUploaders/jpg"));
      let microservice = shell.exec(
        path.join(__dirname, "./../../nexcloudUploaders/jpg/upload.sh")
      );
      if (microservice) {
        resolve("done");
      }
    } catch (error) {
      reject(error);
    }
  });

  return await uploadPromise
    .then(async res => {
      let obj = fs.readFileSync(
        path.join(directory, `${file.originalname}.json`),
        "utf-8"
      );
      //borrar de disco los ficheros y carpeta de ser posible.
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
      return JSON.parse(obj);
    })
    .catch(err => {
      console.log(err);
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
    });
};

const pngToServer = async ({ information, file }) => {
  const { name, company } = await models.client.findByPk(information.client);
  const clientName = company
    ? `${information.client}_${company}`
    : `${information.client}_${name}`;

  let baseroot = clientName;
  let directory = path.join(__dirname, "/../tempfile/files", baseroot);
  shell.mkdir(path.join(__dirname, "/../tempfile/files"));
  shell.mkdir(directory);
  const sourcedir = path.join(directory, file.originalname);

  fs.writeFileSync(sourcedir, file.buffer, "utf8", err => {
    if (err) {
      console.log("WRITE: " + err);
    }
  });

  //execute manual script for node
  let uploadPromise = new Promise(async (resolve, reject) => {
    try {
      shell.cd(path.join(__dirname, "./../../nexcloudUploaders/png"));
      let microservice = shell.exec(
        path.join(__dirname, "./../../nexcloudUploaders/png/upload.sh")
      );
      if (microservice) {
        resolve("done");
      }
    } catch (error) {
      reject(error);
    }
  });

  return await uploadPromise
    .then(async res => {
      let obj = fs.readFileSync(
        path.join(directory, `${file.originalname}.json`),
        "utf-8"
      );
      //borrar de disco los ficheros y carpeta de ser posible.
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
      return JSON.parse(obj);
    })
    .catch(err => {
      console.log(err);
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
    });
};

const docToServer = async ({ information, file }) => {
  const { name, company } = await models.client.findByPk(information.client);
  const clientName = company
    ? `${information.client}_${company}`
    : `${information.client}_${name}`;

  let baseroot = clientName;
  let directory = path.join(__dirname, "/../tempfile/files", baseroot);
  shell.mkdir(path.join(__dirname, "/../tempfile/files"));
  shell.mkdir(directory);
  const sourcedir = path.join(directory, file.originalname);

  fs.writeFileSync(sourcedir, file.buffer, "utf8", err => {
    if (err) {
      console.log("WRITE: " + err);
    }
  });

  //execute manual script for node
  let uploadPromise = new Promise(async (resolve, reject) => {
    try {
      shell.cd(path.join(__dirname, "./../../nexcloudUploaders/doc"));
      let microservice = shell.exec(
        path.join(__dirname, "./../../nexcloudUploaders/doc/upload.sh")
      );
      if (microservice) {
        resolve("done");
      }
    } catch (error) {
      reject(error);
    }
  });

  return await uploadPromise
    .then(async res => {
      let obj = fs.readFileSync(
        path.join(directory, `${file.originalname}.json`),
        "utf-8"
      );
      //borrar de disco los ficheros y carpeta de ser posible.
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
      return JSON.parse(obj);
    })
    .catch(err => {
      console.log(err);
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
    });
};

const docxToServer = async ({ information, file }) => {
  const { name, company } = await models.client.findByPk(information.client);
  const clientName = company
    ? `${information.client}_${company}`
    : `${information.client}_${name}`;

  let baseroot = clientName;
  let directory = path.join(__dirname, "/../tempfile/files", baseroot);
  shell.mkdir(path.join(__dirname, "/../tempfile/files"));
  shell.mkdir(directory);
  const sourcedir = path.join(directory, file.originalname);

  fs.writeFileSync(sourcedir, file.buffer, "utf8", err => {
    if (err) {
      console.log("WRITE: " + err);
    }
  });

  //execute manual script for node
  let uploadPromise = new Promise(async (resolve, reject) => {
    try {
      shell.cd(path.join(__dirname, "./../../nexcloudUploaders/docx"));
      let microservice = shell.exec(
        path.join(__dirname, "./../../nexcloudUploaders/docx/upload.sh")
      );
      if (microservice) {
        resolve("done");
      }
    } catch (error) {
      reject(error);
    }
  });

  return await uploadPromise
    .then(async res => {
      let obj = fs.readFileSync(
        path.join(directory, `${file.originalname}.json`),
        "utf-8"
      );
      //borrar de disco los ficheros y carpeta de ser posible.
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
      return JSON.parse(obj);
    })
    .catch(err => {
      console.log(err);
      cleaner(
        path.join(directory, `${file.originalname}.json`),
        sourcedir,
        directory
      );
    });
};

const getDepartmentFiles = async (params) => {
  //files included by department..
  try {

    let { orderBy, sort, department_id, pageSize, pageNumber } = params;

    let variationParams = returnProtectedParams(params);

    let newParams = {
      orderBy, sort, department_id, pageSize, pageNumber,
      ...variationParams,
      where: {
        department_id
      }
    };
    
    const data = await _filesUser(newParams);
    const filesIds = data.data.map(file => file.id);
    //async copy for easier manipulation.
    let Op = Sequelize.Op;

    const xrefFields = await models.field_file_xref.findAll({
      attributes: {
        exclude: ["id"]
      },
      where: {
        file_id: {
          [Op.in]: filesIds
        },
        value: {
          [Op.ne]: ""
        }
      },
      order: [["value", "DESC"]]
    });

    const fields = await models.field.findAll({
      where: {
        id: {
          [Op.in]: xrefFields.map(xrefField => xrefField.field_id)
        },

        is_visible: true
      }
    });

    let dataValues = data.data.map(file => {
      let obj = {
        ...file
      };

      fields.map(field => {
        const value = xrefFields.find(xrefField => {
          if (xrefField.field_id == field.id && xrefField.file_id == file.id) {
            return xrefField.dataValues.value;
          }
        })
          ? xrefFields.find(xrefField => {
            if (
              xrefField.field_id == field.id &&
              xrefField.file_id == file.id
            ) {
              return xrefField.dataValues.value;
            }
          }).dataValues.value
          : "";

        obj = {
          ...obj,
          [field.name]: value
        };
      });

      return obj;
    });

    //order dataValues
    if (orderBy != "name") {
      let aux = [];
      dataValues.forEach(ele => {
        aux.push(ele);
      });
      sort == "asc"
        ? aux.sort((a, b) =>
          a.orderBy > b.orderBy
            ? 1
            : a.orderBy === b.orderBy
              ? a.name > b.name
                ? 1
                : -1
              : -1
        )
        : aux.sort((a, b) =>
          a.orderBy < b.orderBy
            ? 1
            : a.orderBy === b.orderBy
              ? a.name < b.name
                ? 1
                : -1
              : -1
        );

      return {
        ...data,
        data: aux
      };
    }

    return {
      ...data,
      data: dataValues
    };
  } catch (error) {
    logger.log({
      level: "error",
      message: `Hubo un problema al intentar recuperar las files de un departamento: ${error.toString()}`,
      user_role: "admin || client",
      user_id: null,
      timestamp: moment(),
      request: "getDepartmentFiles()",
      request_status: "fail",
      request_data: {
        params: newParams
      }
    });
    throw error;
  }
};


const returnProtectedParams = params => {
  const protectedParams = [
    "orderBy",
    "sort",
    "pageNumber",
    "pageSize",
    "id",
    "role",
    "department",
    "department_id",
    "client"
  ];
  let parseParams = {};
  parseParams["protectedParams"] = {};
  parseParams["others"] = {};

  //protected params
  protectedParams.forEach(p => (parseParams["protectedParams"][p] = params[p]));

  //not protected params
  Object.keys(params)
    .filter(param => !protectedParams.find(pp => pp == param))
    .forEach(p => (parseParams["others"][p] = params[p]));

  return parseParams;
};

module.exports = {
  getFiles,
  createFile,
  deleteFile,
  checkNullfolder,
  downloadRaw,
  previewFile,
  getDepartmentFiles
};
