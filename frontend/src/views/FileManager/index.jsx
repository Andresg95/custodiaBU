import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import Table from "./searchableTable";
import Button from "@material-ui/core/Button";

//icons.
import AttachIcon from "@material-ui/icons/AttachFile";
import SearchIcon from "@material-ui/icons/SearchTwoTone";
import ArrowIconRight from "@material-ui/icons/KeyboardArrowRight";
import ArrowIconLeft from "@material-ui/icons/KeyboardArrowLeft";
import Tooltip from "@material-ui/core/Tooltip";
import CancelIcon from "@material-ui/icons/CancelOutlined";

//self-made.
import Notification from "../../components/notification";
import Select from "../../components/select";
import FilePreview from "./filePreview";
import Dropzone from "./dropzone";
import Input from "./formInput";

//api.
import ClientsApi from "../../api/clients";
import UsersApi from "../../api/users";
import ApiConfig from "../../api/config";
import FilesApi from "../../api/files";
import FieldsApi from "../../api/fields";
import ENV_VARIABLES from "../../config/enviromentConfig";

//context
import { ColorConsumer } from "../../context/colorContext";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

//
import { MetroSpinner } from "react-spinners-kit";
import { IconButton } from "@material-ui/core";

//Routing
//import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

var moment = require("moment");
moment().format();

// Input validation types
const VALIDATION_TYPE = {
  alphanumeric: 1,
  text: 2,
  date: 3,
  numeric: 4
};

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: "center",
    backgroundColor: "#f6f6f6",
    color: theme.palette.text.secondary
  }
});

class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userSession: {
        role: "",
        id: null
      },

      data: [],
      columns: [],
      isNotificationOpen: false,

      //File viewer
      viewMode: false,
      viewFile: null,
      currentViewPage: 1,
      currentViewDocument: "",

      //Upload file
      singleUploadState: 0,
      isInputValidated: [],
      fileSelectedSingle: [],
      isButtonDisabled: true,

      uploadColor: "#9D9D9D",
      buttonBackground: "#E2E2E2",

      singleUploadButtonDisabled: false,
      multipleUploadButtonDisabled: false,

      multipleUploadState: 0,
      informationJson: { name: "", file: "" },
      clientSelected: null,
      departmentSelected: null,
      filesSelectedMultiple: [],
      clientList: [],

      loading: true,
      uploading: {
        active: false,
        percentage: 0
      },

      previewPageNumber: 1,

      //View departments table
      clientTableMode: false,
      clientTableSelected: null,
      departmentTableSelected: null,
      departmentTableId: null,
      showTable: true,

      //File search
      searchMode: false,
      totalItems: 0,
      sort: {
        orderBy: "name",
        sort: "asc",
        pageNumber: 0,
        pageSize: 10
      },
      filters: []
    };

    this.tableElement = React.createRef();
  }
  static contextType = ColorConsumer;

  componentWillMount = async () => {
    this.setState({
      userSession: {
        role: await ApiConfig.getUser(),
        id: await ApiConfig.getId()
      }
    });
  };

  componentDidMount = async () => {
    if ((await ApiConfig.getUser()) == "admin") {
      this.getClientsData();
    } else {
      this.getClientData(); //Single client
    }

    this.getFields();

    this.getFiles();
  };

  ///////////////////////////////////////////////////////////////
  // loading.
  ///////////////////////////////////////////////////////////////

  getFields = async () => {
    if ((await ApiConfig.getUser()) == "user") {
      UsersApi.getById(await ApiConfig.getId()).then(user => {
        FieldsApi.getByDepartmentId(user.department_id).then(response => {
          let buildFieldsObject = new Promise((resolve, reject) => {
            response = response.filter(
              fieldResponse => fieldResponse.is_visible
            );
            let columnsArray = response.map(field => {
              return {
                name: field.name,
                title: field.name.charAt(0).toUpperCase() + field.name.slice(1)
              };
            });

            columnsArray.unshift({ name: "name", title: "Nombre" });

            resolve(columnsArray);
          });

          buildFieldsObject.then(async columns => {
            this.setState({
              columns
            });
          });
        });
      });
    } else {
      this.setState({
        columns: [
          { name: "name", title: "Nombre" },
          { name: "creation_date", title: "Fecha de creación" },
          { name: "extension", title: "Formato" },
          { name: "client", title: "Cliente" },
          { name: "department", title: "Departamento" }
        ]
      });
    }
  };
  getClientData = async () => {
    if ((await ApiConfig.getUser()) == "client") {
      ClientsApi.getCustomizationData(await ApiConfig.getId())
        .then(response => {
          this.context.updateColor(response.color);
          this.context.updateAvatar(response.avatar);
          ClientsApi.getById(this.state.userSession.id)
            .then(response => {
              this.setState({
                clientTableSelected: response
              });
            })
            .catch(e => {
              this.openNotification(
                "No se pudo encontrar a este cliente",
                "error"
              );
            });
        })
        .catch(e => {
          this.openNotification(
            "Hubo un problema buscando la información del cliente",
            "error"
          );
        });
    } else {
      UsersApi.getById(await ApiConfig.getId())
        .then(userResponse => {
          ClientsApi.getCustomizationData(userResponse.client_id)
            .then(response => {
              this.context.updateColor(response.color);
              this.context.updateAvatar(response.avatar);
            })
            .catch(e => {
              this.openNotification(
                "Hubo un problema buscando la información del cliente",
                "error"
              );
            });
        })
        .catch(e => {
          this.openNotification(
            "Hubo un problema buscando la información del usuario",
            "error"
          );
        });
    }
  };

  getClientsData = async () => {
    if ((await ApiConfig.getUser()) == "admin") {
      ClientsApi.getAll()
        .then(response => {
          this.prepareClientObject(response);
        })
        .catch(e => {
          this.openNotification(
            "Hubo un problema buscando la información de los clientes",
            "error"
          );
        });
    }
  };

  getFiles = async () => {
    const id = await ApiConfig.getId();
    const roleArray = await ApiConfig.getUser();
    const role = roleArray[0];

    let params = {};

    if (this.state.clientTableMode) {
      params = {
        id: this.state.departmentTableId,
        ...this.state.sort,
        ...this.state.filters
      };

      FilesApi.getDepartmentFiles(params).then(response => {
        this.setState({
          data: response.data,
          totalItems: response.totalCount,
          showTable: true
        });
      });
    } else {
      params = {
        id: id,
        role: role,
        ...this.state.sort,
        ...this.state.filters
      };

      FilesApi.getAll(params)
        .then(response => {
          if (response.length !== 0) {
            this.setState({
              data: response.data,
              totalItems: response.totalCount,
              loading: false,
              uploading: {
                active: false,
                percentage: 0
              },
              showTable: true,
              clientTableSelected:
                this.state.userSession.role == "admin"
                  ? null
                  : this.state.clientTableSelected,
              departmentTableSelected: null
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  prepareClientObject = client => {
    let auxArray = [];

    client.forEach(clientItem => {
      let clientObject = {
        id: clientItem.id,
        name: clientItem.company
          ? clientItem.company
          : clientItem.name + " " + clientItem.last_name
      };

      auxArray.push(clientObject);
    });

    this.setState({
      clientList: auxArray
    });
  };

  ///////////////////////////////////////////////////////////////
  // upload file.
  ///////////////////////////////////////////////////////////////

  /**
   * Select client for the files to be uploaded
   * @param {number} client: Id of client selected
   */
  handleClientSelect = client => {
    ClientsApi.getById(client)
      .then(response => {
        this.setState({
          clientSelected: response
        });
      })
      .catch(e => {
        this.openNotification("No se pudo encontrar este cliente", "error");
        this.setState({
          singleUploadState: 0,
          isInputValidated: [],
          fileSelectedSingle: [],
          isButtonDisabled: true,

          uploadColor: "#9D9D9D",
          buttonBackground: "#E2E2E2",

          singleUploadButtonDisabled: false,
          multipleUploadButtonDisabled: false,

          clientSelected: null,
          departmentSelected: null
        });
      });
  };

  /**
   * Selected files to be uploaded
   * @param {array} files: Files selected
   */
  handleSingleFileSelection = files => {
    this.setState({
      fileSelectedSingle: files
    });
  };

  /**
   * Select deparment for the files to be uploaded
   * @param {number} department: Department selected
   */
  handleDepartmentSelect = department => {
    FieldsApi.getByDepartmentId(department)
      .then(response => {
        this.setState({
          departmentSelected: department,
          fields: response
        });
      })
      .catch(e => {
        this.openNotification(
          "No se pudo encontrar este departamento",
          "error"
        );
        this.setState({
          singleUploadState: 0,
          isInputValidated: [],
          fileSelectedSingle: [],
          isButtonDisabled: true,

          uploadColor: "#9D9D9D",
          buttonBackground: "#E2E2E2",

          singleUploadButtonDisabled: false,
          multipleUploadButtonDisabled: false,

          clientSelected: null,
          departmentSelected: null
        });
      });
  };

  checkInputValidation = (name, isValidated, value, required) => {
    let inputObject = {
      name: name,
      isValidated: isValidated,
      value: value,
      required
    };

    let auxArray = [];

    if (inputObject.isValidated === null) {
      auxArray = this.state.isInputValidated;
      auxArray.push(inputObject);
    } else {
      auxArray = this.state.isInputValidated;
      auxArray.forEach(element => {
        if (element.name === name) {
          element.isValidated = isValidated;
          element.value = value;
        }
      });
    }

    this.setState({
      isInputValidated: auxArray
    });

    this.enableButton();
  };

  getFieldType = type => {
    switch (type.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
      case "numero":
        return VALIDATION_TYPE.numeric;

      case "texto":
        return VALIDATION_TYPE.text;

      case "fecha":
        return VALIDATION_TYPE.date;
      case "alfanumerico":
        return VALIDATION_TYPE.alphanumeric;
      default:
        this.openNotification("Tipo de valor no aceptado", "error");
    }
  };

  getFieldLabel = (name, type) => {
    if (type == "fecha") {
      return name.charAt(0).toUpperCase() + name.slice(1) + " (DD/MM/AAAA)";
    } else {
      return name.charAt(0).toUpperCase() + name.slice(1) + " (" + type + ") ";
    }
  };

  //If the form is filled correctly, enable "CREATE" button
  enableButton = async () => {
    let elementsWithValue = [];
    let excludedNotRequired = [...this.state.isInputValidated];
    this.state.isInputValidated.forEach(element => {
      if (!element.required && element.value == "") {
        excludedNotRequired.pop();
      }
      if (element.isValidated) {
        elementsWithValue.push({ id: element.id, value: element.value });
      }
    });

    if (elementsWithValue.length === excludedNotRequired.length) {
      this.setState({
        isButtonDisabled: false,
        uploadColor: this.context.color,
        buttonBackground: "white"
      });
    } else {
      this.setState({
        isButtonDisabled: true,
        uploadColor: "#9D9D9D",
        buttonBackground: "#E2E2E2"
      });
    }
  };

  uploadSingleFiles = async () => {

    console.log("comenzando a subir files");

    this.setState({
      uploading: {
        active: true,
        percentage: 0
      }
    });
    let buildObject = new Promise((resolve, reject) => {
      let fieldValues = {};
      let count = 0;
      this.state.isInputValidated.forEach(field => {
        fieldValues[field.name] = field.value;
        count++;
        if (count == this.state.isInputValidated.length) {
          console.log(`${this.state.isInputValidated.length},  es igual a ${count}`);
          console.log({ algo: this.state.isInputValidated });

          resolve(fieldValues);
        }
      });
      console.log("mismatch in filessss")
      reject(new Error("files and json object amount missmatch"))
    });

    await buildObject.then(values => {
      const informationObject = {
        client: this.state.clientSelected.id,
        department_id: this.state.departmentSelected,
        values: values
      };

      let uploadFile = new Promise((resolve, reject) => {
        let count = 0;

        this.state.fileSelectedSingle.forEach(files => {
          var formData = new FormData();

          formData.append("files", files);
          formData.append("information", JSON.stringify(informationObject));
          this.openNotification("El fichero se está subiendo", "info");

          this.setState({
            singleUploadButtonDisabled: true
          });
          FilesApi.create(formData)
            .then(response => {
              this.setState({
                uploading: {
                  active: true,
                  percentage: 100
                },
                loading: true,
                singleUploadState: 0,
                fileSelectedSingle: [],
                departmentSelected: null,
                clientSelected: null,
                singleUploadButtonDisabled: false
              });
              this.getFiles();
              if (count == this.state.fileSelectedSingle.length) {
                resolve();
              } else {
                count++;
              }
            })
            .catch(e => {
              this.openNotification(e.response.data.error.error, "error");
              this.setState({
                singleUploadState: 0,
                isInputValidated: [],
                fileSelectedSingle: [],
                isButtonDisabled: true,

                uploadColor: "#9D9D9D",
                buttonBackground: "#E2E2E2",

                singleUploadButtonDisabled: false,
                multipleUploadButtonDisabled: false,

                clientSelected: null,
                departmentSelected: null,
                uploading: {
                  active: false,
                  percentage: 0
                }
              });
            });
        });
      });

      uploadFile.then(async () => {
        this.openNotification("Fichero subido con éxito", "success");
        await this.getFiles();
      });
    });

    await buildObject.catch(async (e) => {
      console.log("failed to upload this files, returning to default view");
      this.openNotification(e)
      await this.getFiles();
    })
  };

  ////////////////
  // multiple files.
  ////////////////

  handleMultipleFileSelection = files => {
    this.setState({
      filesSelectedMultiple: files
    });
  };

  uploadMultipleFiles = () => {
    //Crear objeto de fichero relacional
    let buildInformationObject = new Promise((resolve, reject) => {

      try {
        console.log("comenzando la subida de ficheros");

        var file = this.state.informationJson.file;
        var r = new FileReader();
        r.onload = (function (file) {
          return function (e) {
            var contents = e.target.result;
            resolve(contents);
          };
        })(file);
        r.readAsText(file);
        console.log({ r });

      } catch (error) {

        this.openNotification(
          `Error: ${error}`, "error"
        );

        reject(error);
      }
    }).then(values => {
      let relationalValues = "";
      const totalFiles = this.state.filesSelectedMultiple.length;
      let fileArrayCopy = this.state.filesSelectedMultiple;
      if (values) {
        try {
          relationalValues = JSON.parse(values);

          let uploadFiles = new Promise((resolve, reject) => {
            if (relationalValues.length != totalFiles) {
              this.setState({
                informationJson: { name: "", file: "" }
              });
              reject(new Error("El tamaño del json proporcionado no coincide con la cantidad de archivos enviados"));
              throw null;
            }

            this.openNotification(
              "Subiendo sus ficheros, esto puede tardar un momento",
              "info"
            );
            const uploadIndividualFile = (formData, fileName) => {
              FilesApi.create(formData)
                .then(response => {
                  fileArrayCopy.shift();

                  recursiveSingleUpload();
                  this.setState({
                    loading: true,
                    //  departmentSelected: null,
                    //  clientSelected: null,
                    uploading: {
                      active: true,
                      percentage: (
                        ((totalFiles - fileArrayCopy.length) / totalFiles) *
                        100
                      ).toFixed(0)
                    }
                  });
                })
                .catch(e => {
                  this.openNotification(
                    `Hubo un error intentando subir el fichero ${fileName}, reintentando`,
                    "error"
                  );

                  FilesApi.create(formData)
                    .then(response => {
                      fileArrayCopy.shift();

                      recursiveSingleUpload();
                      this.setState({
                        loading: true,
                        //  departmentSelected: null,
                        //  clientSelected: null,
                        uploading: {
                          active: true,
                          percentage: (
                            ((totalFiles - fileArrayCopy.length) / totalFiles) *
                            100
                          ).toFixed(0)
                        }
                      });
                    })
                    .catch(e => {
                      this.openNotification(
                        fileName + ": " + e.response.data.error.error,
                        "error"
                      );
                      this.setState({
                        multipleUploadState: 0,
                        filesSelectedMultiple: [],
                        departmentSelected: null,
                        clientSelected: null,
                        multipleUploadButtonDisabled: false,
                        uploadColor: "#9D9D9D",
                        buttonBackground: "#E2E2E2",
                        singleUploadButtonDisabled: false,
                        uploading: {
                          active: false,
                          percentage: 0
                        }
                      });
                    });
                });
            };

            const recursiveSingleUpload = () => {
              if (fileArrayCopy.length) {
                const file = fileArrayCopy[0];

                var formData = new FormData();
                let filteredArrayXref = relationalValues.filter(
                  value => value.DOC_ID === file.name
                );
                delete filteredArrayXref[0].DOC_ID;
                var individualFile = {
                  client: this.state.clientSelected.id,
                  department_id: this.state.departmentSelected,
                  values: filteredArrayXref[0]
                };

                this.setState({
                  multipleUploadButtonDisabled: true,
                  uploading: {
                    active: true,
                    percentage: this.state.percentage
                  }
                });
                formData.append("files", file);
                formData.append("information", JSON.stringify(individualFile));
                uploadIndividualFile(formData, file.name);
              } else {
                this.setState({});
                resolve();
              }
            };
            recursiveSingleUpload();
          });


          uploadFiles.then(response => {
            this.getFiles();

            this.openNotification("Ficheros subidos con éxito", "success");
            this.setState({
              multipleUploadState: 0,
              filesSelectedMultiple: [],
              departmentSelected: null,
              clientSelected: null,
              multipleUploadButtonDisabled: false
            });
          }).catch(e => {
            console.log("upload files validation error");
            this.openNotification(e.toString(), "error");
            this.getFiles();
          })
        } catch (e) {
          console.log(e);

          this.openNotification(
            `Hubo un error en su json: ${e}`, "error"

          );
        }
      }
    })
      .catch(async (e) => {
        console.log(e);
        this.openNotification(
          
          "error"
        );
        this.getFiles();
        
      })

  };

  ///////////////////////////////////////////////////////////////
  // file viewer.
  ///////////////////////////////////////////////////////////////

  nextPage = async () => {
    this.openView("loading", this.state.currentViewDocument);
    await this.setState({
      currentViewPage: this.state.currentViewPage + 1
    });

    FilesApi.preview({
      id: this.state.currentViewDocument,
      page: this.state.currentViewPage
    })
      .then(response => {
        this.openView(
          response.data,
          this.state.currentViewDocument,
          response.totalCount
        );
      })
      .catch(e => {
        console.log(e);
      });
  };

  previousPage = async () => {
    this.openView("loading", this.state.currentViewDocument);
    await this.setState({
      currentViewPage: this.state.currentViewPage - 1
    });

    FilesApi.preview({
      id: this.state.currentViewDocument,
      page: this.state.currentViewPage
    })
      .then(response => {
        this.openView(
          response.data,
          this.state.currentViewDocument,
          response.totalCount
        );
      })
      .catch(e => {
        console.log(e);
      });
  };

  previewPage = previewPageNumber => {
    this.setState({ currentViewPage: 1 });
    this.setState({ previewPageNumber });
  };

  /**
   * Open file viewer
   * @param {string} file: URL of file to be showed
   * @param {string} type: File format
   */
  openView = async (file, id, totalPages, extension) => {
    await this.closeView();
    await this.setState({
      viewMode: true,
      viewFile: {
        url: file,
        totalPages,
        extension
      },
      currentViewDocument: id
    });
  };

  //Close file viewer
  closeView = () => {
    this.setState({
      viewMode: false
    });
  };

  closeNotification = () => {
    this.setState({
      isNotificationOpen: false
    });
  };

  /**
   * Open snackbar notification
   * @param {string} text: Message showed in the snackbar
   * @param {string} type: Error, success, warning, etc-
   */
  openNotification = (text, type) => {
    this.setState({
      isNotificationOpen: true,
      notificationText: text,
      notificationType: type
    });
  };

  handleFilters = async filters => {
    const filterObject = {};
    filters.map(filter => {
      filterObject[filter.columnName] = filter.value;
    });

    await this.setState({
      filters: filterObject
    });

    this.getFiles();
  };

  searchFilters = () => {
    if (this.tableElement.current) {
      this.tableElement.current.returnFilters();
    }
  };

  handleSort = async sort => {
    await this.setState({ sort });
    this.getFiles();
  };

  /**
   * Select client for table visualization
   * @param {number} client: Id of client selected
   */

  handleClientSelectForTable = client => {
    if (this.state.userSession.role == "client") {
      ClientsApi.getById(this.state.userSession.id)
        .then(response => {
          this.setState({
            clientTableSelected: response
          });
        })
        .catch(e => {
          this.openNotification("No se pudo encontrar a este cliente", "error");
        });
    } else {
      ClientsApi.getById(client)
        .then(response => {
          this.setState({
            clientTableSelected: response
          });
        })
        .catch(e => {
          this.openNotification("No se pudo encontrar a este cliente", "error");
        });
    }
  };

  /**
   * Select deparment for table visualization
   * @param {number} department: Department selected
   */
  handleDepartmentSelectForTable = department => {
    FieldsApi.getByDepartmentId(department).then(response => {
      this.setState({
        departmentTableSelected: department,
        departmentTableId: department,
        fields: response
      });
    });
  };

  showDepartmentTable = () => {
    FieldsApi.getByDepartmentId(this.state.departmentTableSelected).then(
      response => {
        let buildFieldsObject = new Promise((resolve, reject) => {
          response = response.filter(fieldResponse => fieldResponse.is_visible);
          let columnsArray = response.map(field => {
            return {
              name: field.name,
              title: field.name.charAt(0).toUpperCase() + field.name.slice(1)
            };
          });
          columnsArray.push({
            name: "name",
            title: "Nombre"
          });

          columnsArray.splice(
            columnsArray.indexOf({
              name: "name",
              title: "Nombre"
            }),
            1
          );
          columnsArray.unshift({
            name: "name",
            title: "Nombre"
          });

          resolve(columnsArray);
        });

        buildFieldsObject.then(async columns => {
          this.setState({
            columns,
            clientTableSelected:
              this.state.userSession.role == "admin"
                ? null
                : this.state.clientTableSelected,
            departmentTableSelected: null
          });
        });
      }
    );

    this.getFiles();
  };

  render() {
    const { classes } = this.props;
    const { viewFile, viewMode } = this.state;

    return (
      <div>
        <Notification
          message={this.state.notificationText}
          type={this.state.notificationType}
          handleNotificationOpen={this.state.isNotificationOpen}
          handleNotificationClose={this.closeNotification}
        />
        <Grid container spacing={24}>
          <Grid item xs={9}>
            <Grid container spacing={24} style={{ marginBottom: "-26px" }}>
              <Grid
                item
                xs={8}
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center"
                }}
              >
                <Typography variant="h2">Gestión de documentos</Typography>
                  <Tooltip title="Búsqueda avanzada">
                    <IconButton
                      style={{ padding: 5, marginLeft: 10 }}
                      onClick={async () => {
                        await this.setState({
                          searchMode: !this.state.searchMode,
                          showTable: true,
                          sort: {
                            orderBy: "name",
                            sort: "asc",
                            pageNumber: 0,
                            pageSize: this.state.pageSize
                          },
                          filters: []
                        });
                        if (
                          this.state.searchMode === false
                        ) {
                          await this.getFiles();
                        }
                      }}
                    >
                      <ColorConsumer>
                        {({ color }) => (
                          <SearchIcon
                            style={{
                              fontSize: 36,
                              color: this.state.searchMode ? color : "#353535"
                            }}
                          />
                        )}
                      </ColorConsumer>
                    </IconButton>
                  </Tooltip>
                  
              </Grid>
              <Grid
                item
                xs={4}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center"
                }}
              >
                {this.state.clientTableMode &&
                  (this.state.userSession.role == "admin" ||
                    this.state.userSession.role == "client") && (
                    <Tooltip title="Tabla global">
                      <IconButton
                        onClick={async () => {
                          this.setState({
                            clientTableMode: false,
                            showTable: true,
                            searchMode: false,
                            viewMode: false,
                            sort: {
                              orderBy: "name",
                              sort: "asc",
                              pageNumber: 0,
                              pageSize: this.state.pageSize
                            },
                            filters: []
                          });

                          this.getClientsData();
                          await this.getFiles();
                          await this.getFields();
                        }}
                      >
                        <ArrowIconLeft
                          style={{
                            fontSize: 28
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                {!this.state.clientTableMode &&
                  !this.state.searchMode &&
                  (this.state.userSession.role == "admin" ||
                    this.state.userSession.role == "client") && (
                    <Tooltip title="Tabla de departamento">
                      <IconButton
                        onClick={() => {
                          this.setState({
                            clientTableMode: true,
                            showTable: false,
                            searchMode: false,
                            viewMode: false
                          });
                        }}
                      >
                        <ArrowIconRight
                          style={{
                            fontSize: 28
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                {this.state.searchMode && (
                  <Button variant="outlined" onClick={this.searchFilters}>
                    {" "}
                    Buscar{" "}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={9} style={{ marginTop: 12 }}>
            <Paper className={classes.paper}>
              {(() => {
                if (
                  !this.state.loading &&
                  !this.state.uploading.active &&
                  this.state.showTable
                ) {
                  return (
                    <div>
                      {this.state.data != "" ? (
                        <Table
                          onPreviewPage={this.previewPage}
                          ref={this.tableElement}
                          view={this.openView}
                          isViewOpen={viewMode}
                          data={this.state.data}
                          columns={this.state.columns}
                          returnFilters={this.handleFilters}
                          searchMode={this.state.searchMode}
                          returnSort={this.handleSort}
                          totalItems={this.state.totalItems}
                        />
                      ) : (
                          <div>
                            {" "}
                            <Typography variant="caption">
                              {" "}
                              No se encontraron ficheros.{" "}
                            </Typography>{" "}
                          </div>
                        )}
                    </div>
                  );
                } else if (this.state.uploading.active) {
                  return <Progress percent={this.state.uploading.percentage} />;
                } else if (
                  this.state.clientTableMode &&
                  !this.state.showTable
                ) {
                  return (
                    <div>
                      {" "}
                      <Typography variant="caption">
                        {" "}
                        Seleccione un cliente y un departamento para visualizar
                        la tabla con índices.
                      </Typography>{" "}
                    </div>
                  );
                } else {
                  return (
                    <ColorConsumer>
                      {({ color }) => (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            margin: 15
                          }}
                        >
                          {" "}
                          <MetroSpinner
                            size={50}
                            color={color}
                            loading={true}
                          />
                        </div>
                      )}
                    </ColorConsumer>
                  );
                }
              })()}
            </Paper>
          </Grid>
          <Grid item xs={3} style={{ marginTop: 12 }}>
            {viewMode && viewFile ? (
              <Paper className={classes.paper}>
                <FilePreview
                  id={this.state.currentViewDocument}
                  previewPageNumber={this.state.previewPageNumber}
                  file={viewFile.url}
                  extension={viewFile.extension}
                  totalPages={viewFile.totalPages}
                  currentPage={this.state.currentViewPage}
                  close={this.closeView}
                  next={this.nextPage}
                  previous={this.previousPage}
                />
              </Paper>
            ) : (
                <div>
                  {this.state.userSession.role !== "" &&
                    this.state.userSession.role == "admin" &&
                    !this.state.clientTableMode && (
                      <div>
                        {this.state.multipleUploadState === 0 && (
                          <div>
                            <Paper className={classes.paper}>
                              {this.state.singleUploadState === 0 && (
                                <div>
                                  <Dropzone
                                    returnFiles={this.handleSingleFileSelection}
                                    text="Seleccionar fichero individual"
                                    type="single"
                                  />
                                  <ColorConsumer>
                                    {({ color }) => (
                                      <Button
                                        variant="outlined"
                                        style={{
                                          marginTop: "10px",

                                          color:
                                            this.state.fileSelectedSingle == ""
                                              ? "#9D9D9D"
                                              : color,
                                          borderColor:
                                            this.state.fileSelectedSingle == ""
                                              ? "#9F9F9F"
                                              : color,
                                          backgroundColor:
                                            this.state.fileSelectedSingle == ""
                                              ? "#E2E2E2"
                                              : "white"
                                        }}
                                        disabled={
                                          this.state.fileSelectedSingle == ""
                                        }
                                        onClick={() => {
                                          this.setState({
                                            singleUploadState: 1
                                          });
                                        }}
                                      >
                                        {" "}
                                        Seleccionar cliente
                                    </Button>
                                    )}
                                  </ColorConsumer>
                                </div>
                              )}

                              {this.state.singleUploadState === 1 && (
                                <div>
                                  <Select
                                    label="Cliente"
                                    departmentList={this.state.clientList}
                                    selectedValue={this.handleClientSelect}
                                  />
                                  <br />
                                  <br />
                                  {this.state.clientSelected !== null && (
                                    <div>
                                      <Select
                                        label="Departamento"
                                        departmentList={
                                          this.state.clientSelected
                                            ? this.state.clientSelected
                                              .departments
                                            : []
                                        }
                                        selectedValue={
                                          this.handleDepartmentSelect
                                        }
                                      />
                                      <br /> <br />
                                    </div>
                                  )}
                                  <ColorConsumer>
                                    {({ color }) => (
                                      <Button
                                        variant="outlined"
                                        style={{
                                          marginTop: "10px",

                                          color:
                                            this.state.departmentSelected == null
                                              ? "#9D9D9D"
                                              : color,
                                          borderColor:
                                            this.state.departmentSelected == null
                                              ? "#9F9F9F"
                                              : color,
                                          backgroundColor:
                                            this.state.departmentSelected == null
                                              ? "#E2E2E2"
                                              : "white"
                                        }}
                                        disabled={
                                          this.state.departmentSelected == null
                                        }
                                        onClick={() => {
                                          this.setState({
                                            singleUploadState: 2
                                          });
                                        }}
                                      >
                                        {" "}
                                        Llenar clasificaciones
                                    </Button>
                                    )}
                                  </ColorConsumer>
                                </div>
                              )}

                              {this.state.singleUploadState === 2 && (
                                <div>
                                  <Paper
                                    style={{
                                      overflowY: "scroll",
                                      maxHeight: 250,
                                      paddingBottom: 10
                                    }}
                                  >
                                    {this.state.fields &&
                                      this.state.fields.map(field => {
                                        return (
                                          <div>
                                            <Input
                                              name={field.name}
                                              label={this.getFieldLabel(
                                                field.name,
                                                field.type
                                              )}
                                              type={this.getFieldType(field.type)}
                                              checkInputValidation={
                                                this.checkInputValidation
                                              }
                                              required={field.is_required}
                                            />
                                          </div>
                                        );
                                      })}
                                  </Paper>
                                  <br />
                                  <br />
                                  <ColorConsumer>
                                    {({ color }) => (
                                      <Button
                                        variant="outlined"
                                        style={{
                                          color:
                                            this.state
                                              .singleUploadButtonDisabled == true
                                              ? "#9D9D9D"
                                              : color,
                                          borderColor:
                                            this.state
                                              .singleUploadButtonDisabled == true
                                              ? "#9F9F9F"
                                              : color,
                                          backgroundColor:
                                            this.state
                                              .singleUploadButtonDisabled == true
                                              ? "#E2E2E2"
                                              : "white"
                                        }}
                                        disabled={
                                          this.state.singleUploadButtonDisabled
                                        }
                                        onClick={() => {
                                          this.uploadSingleFiles();
                                        }}
                                      >
                                        {" "}
                                        Subir fichero
                                    </Button>
                                    )}
                                  </ColorConsumer>
                                </div>
                              )}
                            </Paper>
                            <br />
                          </div>
                        )}

                        {this.state.singleUploadState === 0 && (
                          <Paper className={classes.paper}>
                            {this.state.multipleUploadState === 0 && (
                              <div>
                                <Dropzone
                                  returnFiles={this.handleMultipleFileSelection}
                                  text="Seleccionar ficheros en grupo (máx. 5000)"
                                  type="multiple"
                                  openNotification={this.openNotification}
                                />
                                <ColorConsumer>
                                  {({ color }) => (
                                    <Button
                                      variant="outlined"
                                      style={{
                                        marginTop: "10px",

                                        color:
                                          this.state.filesSelectedMultiple == ""
                                            ? "#9D9D9D"
                                            : color,
                                        borderColor:
                                          this.state.filesSelectedMultiple == ""
                                            ? "#9F9F9F"
                                            : color,
                                        backgroundColor:
                                          this.state.filesSelectedMultiple == ""
                                            ? "#E2E2E2"
                                            : "white"
                                      }}
                                      disabled={
                                        this.state.filesSelectedMultiple == ""
                                      }
                                      onClick={() => {
                                        this.setState({
                                          multipleUploadState: 1
                                        });
                                      }}
                                    >
                                      {" "}
                                      Seleccionar cliente
                                  </Button>
                                  )}
                                </ColorConsumer>
                              </div>
                            )}

                            {this.state.multipleUploadState === 1 && (
                              <div>
                                <Select
                                  label="Cliente"
                                  departmentList={this.state.clientList}
                                  selectedValue={this.handleClientSelect}
                                />
                                <br />
                                <br />
                                {this.state.clientSelected !== null && (
                                  <div>
                                    <Select
                                      label="Departamento"
                                      departmentList={
                                        this.state.clientSelected
                                          ? this.state.clientSelected.departments
                                          : []
                                      }
                                      selectedValue={this.handleDepartmentSelect}
                                    />
                                    <br /> <br />
                                  </div>
                                )}

                                <ColorConsumer>
                                  {({ color }) => (
                                    <Button
                                      variant="outlined"
                                      color="secondary"
                                      style={{
                                        marginTop: "10px",
                                        color:
                                          this.state.departmentSelected === null
                                            ? "#9D9D9D"
                                            : color,
                                        borderColor:
                                          this.state.departmentSelected === null
                                            ? "#9F9F9F"
                                            : color,
                                        backgroundColor:
                                          this.state.departmentSelected === null
                                            ? "#E2E2E2"
                                            : "white"
                                      }}
                                      disabled={
                                        this.state.departmentSelected === null
                                      }
                                      onClick={() => {
                                        this.setState({
                                          multipleUploadState: 2
                                        });
                                      }}
                                    >
                                      {" "}
                                      Seleccionar archivo relacional
                                  </Button>
                                  )}
                                </ColorConsumer>
                              </div>
                            )}

                            {this.state.multipleUploadState === 2 && (
                              <div>
                                <div>
                                  <label for="json_information">
                                    <Paper
                                      className={classes.paper}
                                      style={{ margin: 15, marginBottom: 0 }}
                                    >
                                      <Typography variant="overline">
                                        {" "}
                                        Seleccionar fichero relacional
                                    </Typography>
                                      <Button
                                        variant="outlined"
                                        style={{
                                          backgroundColor: this.state
                                            .buttonBackground,
                                          color: this.state.uploadColor
                                        }}
                                        onClick={event => {
                                          event.target.parentElement.parentElement.click();
                                        }}
                                      >
                                        <AttachIcon />
                                      </Button>
                                    </Paper>
                                    <Typography
                                      variant="caption"
                                      style={{ fontSize: 12 }}
                                    >
                                      {this.state.informationJson.name}
                                    </Typography>

                                    <input
                                      style={{
                                        display: "none",
                                        color: "transparent"
                                      }}
                                      type="file"
                                      id="json_information"
                                      name="json_information"
                                      accept="application/json"
                                      onChange={event => {
                                        this.setState({
                                          informationJson: {
                                            name: event.target.files[0].name,
                                            file: event.target.files[0]
                                          }
                                        });
                                      }}
                                    />
                                  </label>
                                </div>
                                <br />

                                <ColorConsumer>
                                  {({ color }) => (
                                    <Button
                                      variant="outlined"
                                      color="secondary"
                                      style={{
                                        marginTop: 50,
                                        color:
                                          this.state.informationJson.file == "" ||
                                            this.state
                                              .multipleUploadButtonDisabled == true
                                            ? "#9D9D9D"
                                            : color,
                                        borderColor:
                                          this.state.informationJson.file == "" ||
                                            this.state
                                              .multipleUploadButtonDisabled == true
                                            ? "#9F9F9F"
                                            : color,
                                        backgroundColor:
                                          this.state.informationJson.file == "" ||
                                            this.state
                                              .multipleUploadButtonDisabled === true
                                            ? "#E2E2E2"
                                            : "white"
                                      }}
                                      disabled={
                                        this.state.informationJson.file == "" ||
                                        this.state.multipleUploadButtonDisabled ==
                                        true
                                      }
                                      onClick={() => {
                                        this.uploadMultipleFiles();
                                      }}
                                    >
                                      {" "}
                                      Subir archivos
                                  </Button>
                                  )}
                                </ColorConsumer>
                              </div>
                            )}
                          </Paper>
                        )}
                      </div>
                    )}

                  {!this.state.clientTableMode &&
                    !this.state.uploading.active &&
                    (this.state.singleUploadState !== 0 ||
                      this.state.multipleUploadState !== 0) && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                          margin: 10
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            this.setState({
                              singleUploadState: 0,
                              isInputValidated: [],
                              fileSelectedSingle: [],
                              isButtonDisabled: true,

                              uploadColor: "#9D9D9D",
                              buttonBackground: "#E2E2E2",

                              singleUploadButtonDisabled: false,
                              multipleUploadButtonDisabled: false,

                              multipleUploadState: 0,
                              informationJson: { name: "", file: "" },
                              clientSelected: null,
                              departmentSelected: null,
                              filesSelectedMultiple: [],

                              uploading: {
                                active: false,
                                percentage: 0
                              }
                            });
                          }}
                        >
                          {" "}
                          <CancelIcon />
                        </IconButton>
                      </div>
                    )}

                  {this.state.clientTableMode && (
                    <div>
                      <Paper className={classes.paper}>
                        {this.state.userSession.role == "admin" && (
                          <>
                            <Select
                              label="Cliente"
                              departmentList={this.state.clientList}
                              selectedValue={this.handleClientSelectForTable}
                            />

                            <br />
                            <br />
                          </>
                        )}

                        {this.state.clientTableSelected !== null && (
                          <div>
                            <Select
                              label="Departamento"
                              departmentList={
                                this.state.clientTableSelected
                                  ? this.state.clientTableSelected.departments
                                  : []
                              }
                              selectedValue={this.handleDepartmentSelectForTable}
                            />
                            <br /> <br />
                          </div>
                        )}
                        <ColorConsumer>
                          {({ color }) => (
                            <Button
                              variant="outlined"
                              style={{
                                marginTop: "10px",

                                color:
                                  this.state.departmentTableSelected == null
                                    ? "#9D9D9D"
                                    : color,
                                borderColor:
                                  this.state.departmentTableSelected == null
                                    ? "#9F9F9F"
                                    : color,
                                backgroundColor:
                                  this.state.departmentTableSelected == null
                                    ? "#E2E2E2"
                                    : "white"
                              }}
                              disabled={
                                this.state.departmentTableSelected == null
                              }
                              onClick={() => {
                                this.setState({
                                  sort: {
                                    orderBy: "name",
                                    sort: "asc",
                                    pageNumber: 0,
                                    //searchMode: true,
                                    pageSize: this.state.pageSize
                                  },

                                  filters: []
                                });
                                this.showDepartmentTable();
                              }}
                            >
                              {" "}
                              Ver tabla
                          </Button>
                          )}
                        </ColorConsumer>
                      </Paper>
                    </div>
                  )}
                </div>
              )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

FileManager.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FileManager);
