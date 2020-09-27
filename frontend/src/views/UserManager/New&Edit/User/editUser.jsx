import React from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import { WaveSpinner } from "react-spinners-kit";

import Input from "../formInputEdit";
import Select from "../../../../components/select";
import ClientIcon from "@material-ui/icons/AccountBoxOutlined";
import Button from "@material-ui/core/Button";
import CancelModal from "../Modals/cancelModal";

import Notification from "../../../../components/notification";

//Api
import UsersApi from "../../../../api/users";
import ClientsApi from "../../../../api/clients";
import ApiConfig from "../../../../api/auth";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 1.5,
    textAlign: "center",
    backgroundColor: "white",
    color: theme.palette.text.secondary
  },
  formContainer: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%"
  }
});

// Input validation types
const VALIDATION_TYPE = {
  alphanumeric: 1,
  text: 2,
  email: 3,
  numeric: 4,
  NIF: 5
};

class EditUser extends React.Component {
  state = {
    isViewModalOpen: false,
    isInputValidated: [],
    createColor: "#9D9D9D",
    buttonBackground: "#E2E2E2",
    isButtonDisabled: true,
    userToBeUpdated: {},
    departmentList: [],
    department: null,
    originalEmail: null
  };

  ///////////////////////////////////////////////////////////////
  // USER
  ///////////////////////////////////////////////////////////////

  componentDidMount = () => {
    this.getUserData();
  };

  //Get user and client data from api
  getUserData = () => {
    UsersApi.getById(this.props.location.state.id)
      .then(user => {
        this.setState({
          userToBeUpdated: user,
          originalEmail: user.email
        });
      })
      .catch(e => {
        throw new Error("Hubo un problema recuperando al usuario: " + e);
      })
      .then(() =>
        ClientsApi.getById(this.state.userToBeUpdated.client_id)
          .then(client => {
            const selectedDepartment = client.departments.find(department => {
              return department.id === this.state.userToBeUpdated.department_id;
            });

            this.setState({
              department: selectedDepartment.id,
              departmentList: client.departments
            });
          })
          .catch(e => {
            throw new Error("Hubo un problema recuperando al cliente: " + e);
          })
      );
  };

  /**
   * Check if form fields are empty or with the wrong format, for validation
   * @param {string} name: Name of the form input
   * @param {boolean} isValidated: Is the input filled correctly?
   * @param {string} value: Value of the input
   */
  checkInputValidation = (name, isValidated, value) => {
    let inputObject = {
      name: name,
      isValidated: isValidated === null ? true : isValidated,
      value: value
    };

    let auxArray = [];

    if (isValidated === null) {
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

  //If the form is filled correctly, enable "CREATE" button
  enableButton = async () => {
    let auxArray = [];

    this.state.isInputValidated.forEach(element => {
      if (element.isValidated) {
        auxArray.push(element.name);
      }
    });

    if (auxArray.length === this.state.isInputValidated.length) {
      this.setState({
        isButtonDisabled: false,
        createColor: "white",
        buttonBackground: "#6AD59F"
      });
    } else {
      this.setState({
        isButtonDisabled: true,
        createColor: "#9D9D9D",
        buttonBackground: "#E2E2E2"
      });
    }
  };

  //Create the object from the form data (to be returned for user edit)
  buildUserObject = () => {
    const [nombre, cifnif, apellidos, email] = this.state.isInputValidated;

    const user = {
      id: this.state.userToBeUpdated.id,
      name: nombre.value,
      last_names: apellidos.value,
      cifnif: cifnif.value,
      email: email.value,
      department_id: this.state.department,
      status: "accepted",
      client_id: this.state.userToBeUpdated.client_id
    };

    this.setState({
      userToBeUpdated: user
    });
  };

  ///////////////////////////////////////////////////////////////
  // DEPARTMENT
  ///////////////////////////////////////////////////////////////

  /**
   * Select department
   * @param {number} department: Department object
   */
  handleDepartmentSelect = async department => {
    await this.setState({
      department: department
    });

    this.enableButton();
  };

  ///////////////////////////////////////////////////////////////
  // GENERAL FUNC.
  ///////////////////////////////////////////////////////////////

  closeModal = () => {
    this.setState({
      isViewModalOpen: false
    });
  };

  openModal = () => {
    this.setState({
      isViewModalOpen: true
    });
  };

  closeNotification = () => {
    this.setState({
      isNotificationOpen: false
    });
  };

  openNotification = (text, type) => {
    this.setState({
      isNotificationOpen: true,
      notificationText: text,
      notificationType: type
    });
  };

  //Sleep in miliseconds
  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  //Edit user
  edit = async () => {
    await this.buildUserObject();

    if (this.state.userToBeUpdated.email !== this.state.originalEmail) {
      ApiConfig.checkEmailRepetition({
        email: this.state.userToBeUpdated.email
      })
        .then(response => {
          if (response === true) {
            UsersApi.update(this.state.userToBeUpdated)
              .then(response => {
                this.openNotification(
                  "El usuario ha sido editado con exito.",
                  "success"
                );
                this.sleep(1500).then(() => {
                  this.props.history.push("/filemng");
                });
              })
              .catch(e => {
                this.openNotification(
                  "Hubo un problema editando el usuario",
                  "error"
                );
              });
          } else {
            this.openNotification(
              "Este email ya está en uso. Debe elegir un email único",
              "warning"
            );
          }
        })
        .catch(e => {
          this.openNotification("Hubo un error validando el email", "error");
        });
    } else {
      UsersApi.update(this.state.userToBeUpdated)
        .then(response => {
          this.openNotification(
            "El usuario ha sido editado con exito.",
            "success"
          );
          this.sleep(1500).then(() => {
            this.props.history.push("/filemng");
          });
        })
        .catch(e => {
          this.openNotification(
            "Hubo un problema editando el usuario",
            "error"
          );
        });
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <CancelModal
          handleModalOpen={this.state.isViewModalOpen}
          handleModalNo={this.closeModal}
        />

        <Notification
          message={this.state.notificationText}
          type={this.state.notificationType}
          handleNotificationOpen={this.state.isNotificationOpen}
          handleNotificationClose={this.closeNotification}
        />
        <Grid container spacing={24}>
          {/* Clients & Users */}
          <Grid item xs={12}>
            <Typography variant="h2">Editar usuario</Typography>
          </Grid>

          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid item className={classes.paper} xs={12}>
                <Typography
                  variant="caption"
                  gutterBottom
                  style={{
                    textAlign: "left",
                    paddingTop: 0,
                    color: "#A3A3A3"
                  }}
                >
                  <ClientIcon
                    style={{
                      paddingTop: 0,
                      verticalAlign: "sub"
                    }}
                  />
                  DATOS DEL USUARIO
                </Typography>
                <form>
                  <Grid container>
                    <Grid
                      item
                      className={classes.paper}
                      xs={8}
                      style={{ backgroundColor: "#f6f6f6" }}
                    >
                      <Grid container>
                        <Grid
                          item
                          className={classes.paper}
                          xs={6}
                          style={{ backgroundColor: "#f6f6f6" }}
                        >
                          <Input
                            defaultValue={this.state.userToBeUpdated.name}
                            checkInputValidation={this.checkInputValidation}
                            type={VALIDATION_TYPE.text}
                            name="nombre"
                            label="Nombre"
                            required={true}
                            disabled={true}
                          />

                          <Input
                            defaultValue={this.state.userToBeUpdated.cifnif}
                            checkInputValidation={this.checkInputValidation}
                            type={VALIDATION_TYPE.NIF}
                            name="cifnif"
                            label="CIFNIF"
                            required={true}
                            disabled={true}
                          />
                        </Grid>
                        <Grid
                          item
                          className={classes.paper}
                          xs={6}
                          style={{
                            backgroundColor: "#f6f6f6",
                            borderRight: "2px solid #e1e1e1"
                          }}
                        >
                          <Input
                            defaultValue={this.state.userToBeUpdated.last_names}
                            checkInputValidation={this.checkInputValidation}
                            type={VALIDATION_TYPE.text}
                            name="apellidos"
                            label="Apellidos"
                            required={true}
                            disabled={true}
                          />
                          <Input
                            tabIndex="1"
                            defaultValue={this.state.userToBeUpdated.email}
                            checkInputValidation={this.checkInputValidation}
                            type={VALIDATION_TYPE.email}
                            name="email"
                            label="Email"
                            required={true}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid
                      item
                      className={classes.paper}
                      xs={4}
                      style={{
                        backgroundColor: "#f6f6f6",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          marginTop: "15px",
                          borderStyle: "solid",
                          borderColor:
                            this.state.department === "" ? "#FF5A5F" : "white",
                          borderRadius: "7px",
                          borderWidth: 2
                        }}
                      >
                        {this.state.department !== null ? (
                          <Select
                            tabIndex="2"
                            label="Departamento *"
                            value={this.state.department}
                            departmentList={this.state.departmentList}
                            selectedValue={this.handleDepartmentSelect}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              margin: 15
                            }}
                          >
                            {" "}
                            <WaveSpinner
                              size={30}
                              color="#6AD59F"
                              loading={true}
                            />
                          </div>
                        )}
                      </div>
                    </Grid>
                  </Grid>
                </form>
              </Grid>

              <Button
                tabIndex="3"
                variant="outlined"
                style={{
                  margin: 10,
                  color: this.state.createColor,
                  backgroundColor: this.state.buttonBackground
                }}
                disabled={this.state.isButtonDisabled}
                onClick={() => {
                  this.edit();
                }}
              >
                {" "}
                Guardar{" "}
              </Button>
              <Button
                tabIndex="4"
                variant="outlined"
                style={{
                  margin: 10,
                  backgroundColor: "#FF5A5F",
                  color: "white"
                }}
                onClick={this.openModal}
              >
                {" "}
                Cancelar{" "}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(EditUser);
