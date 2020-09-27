import "date-fns";
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Input from "../../../../components/input";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";

import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";

import DepartmentCard from "./departmentCard";
import FieldCard from "./fieldCard";

import update from "react-addons-update"; // ES6

import DepartmentIcon from "@material-ui/icons/StoreMallDirectoryOutlined";
import FieldIcon from "@material-ui/icons/DashboardOutlined";
import AddIcon from "@material-ui/icons/Add";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import CancelModal from "../Modals/cancelModal";

import { Link } from "react-router-dom";

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 1.5,
    marginTop: 24,
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  list: {
    padding: theme.spacing.unit * 1.5,
    margin: 0,
    textAlign: "center",
    color: theme.palette.text.secondary
  }
});

class Departments extends React.Component {
  state = {
    newDepartment: "",
    newField: {
      id: null,
      name: "",
      type: ""
    },
    selectedDepartment: null,
    departments: [],
    createColor: "#9D9D9D",
    buttonBackground: "#E2E2E2",
    isButtonDisabled: true,
    isViewModalOpen: false
  };

  ///////////////////////////////////////////////////////////////
  // DEPARTMENT
  ///////////////////////////////////////////////////////////////
  editDepartment(index, newData, oldData) {
    const { departments, selectedDepartment } = this.state;
    const departmentIndex = departments.findIndex(
      deparment => deparment.id == selectedDepartment.id
    );

    const newFields = update(departments[departmentIndex].fields, {
      [index]: {
        $merge: {
          name: newData.name,
          type: newData.type,
          wasUpdated: true
        }
      }
    });

    const newDepartmets = update(departments, {
      [departmentIndex]: {
        fields: { $set: newFields }
      }
    });

    this.setState({
      departments: newDepartmets,
      selectedDepartment: newDepartmets[departmentIndex]
    });
  }

  handleNewDepartment = async () => {
    const newDepartment = {
      id: Math.random() * -1,
      name: this.state.newDepartment,
      fields: []
    };
    await this.setState({
      departments: [...this.state.departments, newDepartment]
    });

    this.enableButton();
  };

  handleDepartmentName = input => {
    this.setState({
      newDepartment: input.value
    });
  };

  selectDepartment = department => {
    this.setState({
      selectedDepartment: department
    });
  };

  deleteDepartment = async id => {
    let auxArray = [...this.state.departments];

    var removeIndex = auxArray
      .map(function(item) {
        return item.id;
      })
      .indexOf(id);

    // remove object
    auxArray.splice(removeIndex, 1);

    await this.setState(
      {
        departments: auxArray
      },
      () => this.deselectDepartment()
    );
    this.enableButton();
  };

  deselectDepartment = () => {
    this.setState({ selectedDepartment: null });
  };
  ///////////////////////////////////////////////////////////////
  // FIELDS
  ///////////////////////////////////////////////////////////////

  handleTypeSelect = type => {
    this.setState({
      newField: {
        name: this.state.newField.name,
        type: type.value
      }
    });
  };

  handleFieldName = input => {
    this.setState({
      newField: {
        name: input.value,
        type: this.state.newField.type
      }
    });
  };

  handleNewField = () => {
    if (this.state.selectedDepartment) {
      const newField = {
        id: Math.random() * -1,
        name: this.state.newField.name,
        type: this.state.newField.type,
        is_required: false,
        is_visible: true
      };

      let auxArray = [...this.state.departments];
      auxArray
        .find(department => department.id === this.state.selectedDepartment.id)
        .fields.push(newField);

      this.setState({
        departments: auxArray
      });
    }

    this.enableButton();
  };

  deleteField = async id => {
    let auxArray = [...this.state.selectedDepartment.fields];
    var removeIndex = auxArray.find(field => field.id === id);

    auxArray.splice(auxArray.indexOf(removeIndex), 1);

    let auxDepartmentsArray = [...this.state.departments];
    auxDepartmentsArray.find(
      department => department.id === this.state.selectedDepartment.id
    ).fields = auxArray;

    this.setState({
      selectedDepartment: {
        ...this.state.selectedDepartment,
        fields: auxArray
      },
      departments: auxDepartmentsArray
    });

    await this.enableButton();
  };

  toggleVisibility = id => {
    let auxArray = [...this.state.selectedDepartment.fields];
    auxArray.find(field => field.id === id).is_visible = !auxArray.find(
      field => field.id === id
    ).is_visible;

    let auxDepartmentsArray = [...this.state.departments];
    auxDepartmentsArray.find(
      department => department.id === this.state.selectedDepartment.id
    ).fields = auxArray;

    this.setState({
      selectedDepartment: {
        ...this.state.selectedDepartment,
        fields: auxArray
      },
      departments: auxDepartmentsArray
    });
  };

  toggleRequired = id => {
    let auxArray = [...this.state.selectedDepartment.fields];
    auxArray.find(field => field.id === id).is_required = !auxArray.find(
      field => field.id === id
    ).is_required;

    let auxDepartmentsArray = [...this.state.departments];
    auxDepartmentsArray.find(
      department => department.id === this.state.selectedDepartment.id
    ).fields = auxArray;

    this.setState({
      selectedDepartment: {
        ...this.state.selectedDepartment,
        fields: auxArray
      },
      departments: auxDepartmentsArray
    });
  };

  ///////////////////////////////////////////////////////////////
  // GENERAL
  ///////////////////////////////////////////////////////////////
  enableButton = () => {
    if (this.state.departments.length !== 0) {
      let emptyDepartments = this.state.departments.filter(
        department => department.fields.length == 0
      );

      if (emptyDepartments.length == 0) {
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
    } else {
      this.setState({
        isButtonDisabled: true,
        createColor: "#9D9D9D",
        buttonBackground: "#E2E2E2"
      });
    }
  };

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

  render() {
    const { classes } = this.props;

    return (
      <div>
        <CancelModal
          handleModalOpen={this.state.isViewModalOpen}
          handleModalNo={this.closeModal}
        />
        <Grid item xs={12}>
          <Typography variant="h2">Crear departamentos</Typography>
        </Grid>

        <Paper className={classes.paper}>
          <Grid container>
            <Grid item className={classes.list} xs={6}>
              <Typography
                variant="caption"
                gutterBottom
                style={{
                  textAlign: "left",
                  paddingTop: 0,
                  color: "#A3A3A3"
                }}
              >
                <DepartmentIcon
                  style={{
                    paddingTop: 0,
                    verticalAlign: "sub"
                  }}
                />{" "}
                DEPARTAMENTOS
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
                <Grid container direction="row" alignItems="center">
                  <Grid item xs={8}>
                    <Input
                      returnValue={this.handleDepartmentName}
                      name="newDepartment"
                      label="Nombre del departamento"
                      defaultValue={this.state.newDepartment}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      disabled={this.state.newDepartment == ""}
                      variant="outlined"
                      onClick={() => {
                        this.handleNewDepartment();
                        this.setState({ newDepartment: "" });
                      }}
                    >
                      <AddIcon
                        style={{
                          paddingTop: 0,
                          verticalAlign: "sub"
                        }}
                      />
                    </Button>
                  </Grid>
                  <Grid item xs={2} />
                </Grid>
                <br />
                <Divider />
                <br />

                {this.state.departments.map(department => {
                  return (
                    <Grid
                      container
                      direction="row"
                      alignItems="center"
                      style={{ marginBottom: 15 }}
                    >
                      <Grid item xs={2} />
                      <Grid
                        item
                        xs={8}
                        style={{
                          borderColor: "#FAE279",
                          borderWidth: 3,
                          zIndex: 1500,
                          borderRadius: "4px",
                          borderStyle:
                            this.state.selectedDepartment !== null &&
                            department.id === this.state.selectedDepartment.id
                              ? "solid"
                              : "none"
                        }}
                      >
                        <DepartmentCard
                          returnDepartment={this.selectDepartment}
                          delete={this.deleteDepartment}
                          department={department}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        {" "}
                      </Grid>
                    </Grid>
                  );
                })}
              </Paper>
            </Grid>

            <Grid item className={classes.list} xs={6}>
              <Typography
                variant="caption"
                gutterBottom
                style={{
                  textAlign: "left",
                  paddingTop: 0,
                  color: "#A3A3A3"
                }}
              >
                <FieldIcon
                  style={{
                    paddingTop: 0,
                    verticalAlign: "sub"
                  }}
                />{" "}
                CLASIFICACIONES{" "}
                {this.state.selectedDepartment !== null
                  ? "(" + this.state.selectedDepartment.name + ")"
                  : "(Seleccionar un departamento)"}{" "}
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
                {this.state.selectedDepartment != null && (
                  <div>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={7}>
                        <Input
                          returnValue={this.handleFieldName}
                          name="newFieldName"
                          label="Nombre del campo"
                          defaultValue={this.state.newField.name}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <FormControl
                          variant="outlined"
                          style={{
                            width: "80%",
                            marginTop: 16,
                            marginBottom: 8
                          }}
                        >
                          <InputLabel
                            ref={ref => {
                              this.InputLabelRef = ref;
                            }}
                            htmlFor="outlined-tags-simple"
                          >
                            Tipo
                          </InputLabel>
                          <Select
                            // value={this.state.selectedItem}
                            onChange={event => {
                              this.handleTypeSelect(event.target);
                            }}
                            input={
                              <OutlinedInput
                                value={this.state.newField.type}
                                style={{ float: "left" }}
                                name="items"
                                id="outlined-items-simple"
                              />
                            }
                          >
                            <MenuItem value="" />
                            <MenuItem value={"número"}>Número</MenuItem>
                            <MenuItem value={"fecha"}>Fecha</MenuItem>
                            <MenuItem value={"texto"}>Texto</MenuItem>
                            <MenuItem value={"alfanumérico"}>
                              Alfanumérico
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={1}>
                        <Button
                          variant="outlined"
                          disabled={
                            this.state.newField.name == "" ||
                            this.state.newField.type == ""
                          }
                          onClick={() => {
                            this.handleNewField();
                            this.setState({
                              newField: {
                                id: null,
                                name: "",
                                type: ""
                              }
                            });
                          }}
                        >
                          <AddIcon
                            style={{
                              paddingTop: 0,
                              verticalAlign: "sub"
                            }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                    <br />
                    <Divider />
                    <br />

                    {this.state.selectedDepartment != null ? (
                      this.state.selectedDepartment.fields.map(
                        (field, index) => {
                          return (
                            <Grid
                              container
                              direction="row"
                              alignItems="center"
                              style={{ marginBottom: 15 }}
                            >
                              <Grid item xs={2} />
                              <Grid item xs={8}>
                                <FieldCard
                                  index={index}
                                  field={field}
                                  delete={this.deleteField}
                                  visibility={this.toggleVisibility}
                                  required={this.toggleRequired}
                                  editDepartment={this.editDepartment.bind(
                                    this
                                  )}
                                  editable={
                                    this.state.selectedDepartment.id > 0
                                      ? true
                                      : false
                                  }
                                />
                              </Grid>
                              <Grid item xs={2}>
                                {" "}
                              </Grid>
                            </Grid>
                          );
                        }
                      )
                    ) : (
                      <div> </div>
                    )}
                  </div>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Link
            disabled={true}
            style={{
              textDecoration: "none",
              pointerEvents: this.state.isButtonDisabled ? "none" : "auto"
            }}
            to={{
              pathname: "/confirmclient",
              state: {
                clientInformation: this.props.location.state.clientInformation,
                plan: this.props.location.state.plan,
                color: this.props.location.state.color,
                avatar: this.props.location.state.avatar,
                departments: this.state.departments
              }
            }}
          >
            <Button
              variant="outlined"
              style={{
                margin: 10,
                color: this.state.createColor,
                backgroundColor: this.state.buttonBackground
              }}
              disabled={this.state.isButtonDisabled}
            >
              {" "}
              GUARDAR{" "}
            </Button>
          </Link>
          <Button
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
      </div>
    );
  }
}

Departments.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Departments);
