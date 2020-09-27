import React from "react";

//Material UI
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import IconButton from "@material-ui/core/IconButton";

//Self made components
import FormInput from "../UserManager/New&Edit/formInput";
import FormInputEdit from "../UserManager/New&Edit/formInputEdit";
import PlanCard from "./planCard";
import Notification from "../../components/notification";

//Icons
import StarIcon from "@material-ui/icons/StarBorder";
import DoneIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import Tooltip from "@material-ui/core/Tooltip";

//Context
import { ColorConsumer } from "../../context/colorContext";

//Api
import PlansApi from "../../api/plans";

// Styles applied with classes
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
    justifyContent: "center",
    width: "100%"
  }
});

const VALIDATION_TYPE = {
  alphanumeric: 1,
  text: 2,
  email: 3,
  numeric: 4
};

class PlanManager extends React.Component {
  state = {
    isNotificationOpen: false,
    editMode: false,
    isInputValidatedCreate: [],
    isInputValidatedEdit: [],
    isCreateButtonDisabled: true,
    isEditButtonDisabled: true,
    planToBeCreated: {},
    planToBeUpdated: {},
    planList: []
  };

  ///////////////////////////////////////////////////////////////
  // PLANS
  ///////////////////////////////////////////////////////////////

  //Api request for clients
  componentDidMount = () => {
    this.getPlanList();
  };

  getPlanList = () => {
    PlansApi.getAll()
      .then(response => {
        this.setState({
          planList: response.plan
        });
      })
      .catch(e => {
        this.openNotification(e.toString(), "error");
      });
  };

  ///////////////////////////////////////////////////////////////
  // CREATE PLANS
  ///////////////////////////////////////////////////////////////
  /**
   * Check if form fields are empty or with the wrong format, for validation
   * @param {string} name: Name of the form input
   * @param {boolean} isValidated: Is the input filled correctly?
   * @param {string} value: Value of the input
   */
  checkInputValidationCreate = (name, isValidated, value) => {
    let inputObject = {
      name: name,
      isValidated: isValidated,
      value: value
    };

    let auxArray = [];

    if (inputObject.isValidated === null) {
      auxArray = this.state.isInputValidatedCreate;
      auxArray.push(inputObject);
    } else {
      auxArray = this.state.isInputValidatedCreate;
      auxArray.forEach(element => {
        if (element.name === name) {
          element.isValidated = isValidated;
          element.value = value;
        }
      });
    }

    this.setState({
      isInputValidatedCreate: auxArray
    });

    this.enableButton("create");
  };

  //Create the object from the form data (to be returned for plan creation)
  createPlanObject = () => {
    const [planName, storageSize] = this.state.isInputValidatedCreate;

    const plan = {
      description: planName.value,
      quote: parseInt(storageSize.value)
    };

    this.setState({
      planToBeCreated: plan
    });
  };

  //Create plan
  create = async () => {
    await this.createPlanObject();

    PlansApi.create(this.state.planToBeCreated)
      .then(response => {
        this.openNotification("El plan ha sido creado exitosamente", "success");
      })
      .catch(e => {
        this.openNotification(e.toString(), "error");
      })
      .then(() => {
        this.getPlanList();
      })
      .catch(e => {
        this.openNotification(e.toString(), "error");
      });
  };

  ///////////////////////////////////////////////////////////////
  // EDIT PLANS
  ///////////////////////////////////////////////////////////////

  /**
   * Check if form fields are empty or with the wrong format, for validation
   * @param {string} name: Name of the form input
   * @param {boolean} isValidated: Is the input filled correctly?
   * @param {string} value: Value of the input
   */
  checkInputValidationEdit = (name, isValidated, value) => {
    let inputObject = {
      name: name,
      isValidated: isValidated === null ? true : isValidated,
      value: value
    };

    let auxArray = [];

    if (isValidated === null) {
      auxArray = this.state.isInputValidatedEdit;
      auxArray.push(inputObject);
    } else {
      auxArray = this.state.isInputValidatedEdit;
      auxArray.forEach(element => {
        if (element.name === name) {
          element.isValidated = isValidated;
          element.value = value;
        }
      });
    }

    this.setState({
      isInputValidatedEdit: auxArray
    });

    this.enableButton("edit");
  };

  //Create the object from the form data (to be returned for plan creation)
  updatePlanObject = () => {
    const [planName, storageSize] = this.state.isInputValidatedEdit;

    const plan = {
      id: this.state.planToBeUpdated.id,
      description: planName.value,
      quote: parseInt(storageSize.value)
    };

    this.setState({
      planToBeUpdated: plan
    });
  };

  editPlan = async id => {
    await this.setState({
      editMode: false
    });

    this.setState({
      editMode: true
    });

    let response = await PlansApi.getById(id);

    this.setState({
      planToBeUpdated: response.plan,
      isInputValidatedEdit: []
    });
  };

  //Update plan
  update = async () => {
    await this.updatePlanObject();

    PlansApi.update(this.state.planToBeUpdated)
      .then(async response => {
        await this.setState({
          planToBeUpdated: {},
          isInputValidatedEdit: []
        });

        this.getPlanList();
      })
      .catch(e => {
        this.openNotification(e.toString(), "error");
      });

    this.setState({
      editMode: false
    });
  };

  //If the form is filled correctly, enable "CREATE" button
  enableButton = async type => {
    let auxArray = [];

    switch (type) {
      case "edit":
        this.state.isInputValidatedEdit.forEach(element => {
          if (element.isValidated) {
            auxArray.push(element.name);
          }
        });

        if (auxArray.length === this.state.isInputValidatedEdit.length) {
          this.setState({
            isEditButtonDisabled: false
          });
        } else {
          this.setState({
            isEditButtonDisabled: true
          });
        }
        break;

      case "create":
        this.state.isInputValidatedCreate.forEach(element => {
          if (element.isValidated) {
            auxArray.push(element.name);
          }
        });

        if (auxArray.length === this.state.isInputValidatedCreate.length) {
          this.setState({
            isCreateButtonDisabled: false
          });
        } else {
          this.setState({
            isCreateButtonDisabled: true
          });
        }
        break;
      default:
        this.openNotification("Error interno, lo estamos resolviendo", "error");
    }
  };

  deletePlan = id => {
    PlansApi.delete(id)
      .then(response => {
        this.openNotification("Plan eliminado exitosamente", "success");
      })
      .then(() => {
        this.getPlanList();
      })
      .catch(e => {
        this.openNotification(
          "No se puede eliminar este plan, ya que está asignado a un cliente",
          "error"
        );
      });
  };

  ///////////////////////////////////////////////////////////////
  // GENERAL FUNC.
  ///////////////////////////////////////////////////////////////

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

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Notification
          message={this.state.notificationText}
          type={this.state.notificationType}
          handleNotificationOpen={this.state.isNotificationOpen}
          handleNotificationClose={this.closeNotification}
        />

        {/* Header */}
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant="h2">Gestión de planes</Typography>
          </Grid>

          {/* Clients & Plans */}
          <Grid item xs={9}>
            <Paper className={classes.paper}>
              <Grid container>
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
                    <StarIcon
                      style={{
                        paddingTop: 0,
                        verticalAlign: "sub"
                      }}
                    />{" "}
                    PLANES{" "}
                  </Typography>

                  <Paper
                    square={true}
                    elevation={0}
                    style={{
                      padding: "15px",
                      backgroundColor: "#F6F6F6",
                      overflowY: "scroll",
                      maxHeight: "600px"
                    }}
                  >
                    {/* Client list */}
                    <Grid container spacing={16}>
                      {this.state.planList.map(plan => {
                        return (
                          <Grid item xs={3} style={{ padding: 0 }}>
                            <PlanCard
                              id={plan.id}
                              description={plan.description}
                              quote={plan.quote}
                              onEdit={this.editPlan}
                              onDelete={this.deletePlan}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Utilities */}
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <form
                className={classes.formContainer}
                noValidate
                autoComplete="off"
              >
                <Grid container spacing={16}>
                  <Grid item xs={8}>
                    <FormInput
                      checkInputValidation={this.checkInputValidationCreate}
                      type={VALIDATION_TYPE.text}
                      name="planName"
                      label="Nombre del plan"
                      required={true}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormInput
                      checkInputValidation={this.checkInputValidationCreate}
                      type={VALIDATION_TYPE.numeric}
                      name="storageSize"
                      label="GB"
                      required={true}
                    />
                  </Grid>
                </Grid>
              </form>
              <ColorConsumer>
                {({ color }) => (
                  <Button
                    variant="outlined"
                    style={{
                      marginTop: "10px",
                      color: this.state.isCreateButtonDisabled
                        ? "#9D9D9D"
                        : color,
                      borderColor: this.state.isCreateButtonDisabled
                        ? "#9D9D9D"
                        : color,
                      backgroundColor: this.state.isCreateButtonDisabled
                        ? "#E2E2E2"
                        : "white"
                    }}
                    disabled={this.state.isCreateButtonDisabled}
                    onClick={() => {
                      this.create();
                    }}
                  >
                    {" "}
                    Crear nuevo plan
                  </Button>
                )}
              </ColorConsumer>
            </Paper>

            <br />
            {this.state.editMode && (
              <Paper className={classes.paper}>
                <form
                  className={classes.formContainer}
                  noValidate
                  autoComplete="off"
                >
                  <Grid container spacing={16}>
                    <Grid item xs={8}>
                      <FormInputEdit
                        defaultValue={this.state.planToBeUpdated.description}
                        checkInputValidation={this.checkInputValidationEdit}
                        type={VALIDATION_TYPE.text}
                        name="planName"
                        label="Nombre del plan"
                        required={true}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormInputEdit
                        defaultValue={this.state.planToBeUpdated.quote}
                        checkInputValidation={this.checkInputValidationEdit}
                        type={VALIDATION_TYPE.numeric}
                        name="storageSize"
                        label="GB"
                        required={true}
                      />
                    </Grid>
                  </Grid>
                </form>

                <Tooltip title="Guardar">
                  <IconButton
                    onClick={() => this.update()}
                    aria-label="Delete"
                    disabled={this.state.isEditButtonDisabled}
                    className={classes.buttons}
                  >
                    <DoneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton
                    onClick={() =>
                      this.setState({
                        editMode: false
                      })
                    }
                    aria-label="Delete"
                    className={classes.buttons}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </Paper>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

PlanManager.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PlanManager);
