import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import Notification from "./components/notification";

import InputPassword from "./components/passwordInput";
import { MetroSpinner } from "react-spinners-kit";
import AdminApi from "./api/admin";
import ClientApi from "./api/clients";
import UserApi from "./api/users";
import Tooltip from "@material-ui/core/Tooltip";

//Context
import { ColorConsumer } from "./context/colorContext";

var passwordValidator = require("password-validator");

const bgImge =
  '"' +
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23ffffff' fill-opacity='0.78' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E" +
  '"';
const styles = theme => ({
  root: {
    flexGrow: 1,
    height: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  paper: {
    padding: 0,
    width: "40%",
    textAlign: "center",
    backgroundColor: "#FBFBFC",
    color: theme.palette.text.secondary,
    height: "40vh",

    borderRadius: 15
  },
  image: {
    height: "40vh",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,

    backgroundImage: `url(
      ${bgImge}
    )`
  }
});

class ChangePassword extends React.Component {
  state = {
    isInputValidated: [],
    newPassword: "",
    newPasswordRepeat: "",
    createColor: "#9D9D9D",
    buttonBackground: "#E2E2E2",
    isButtonDisabled: true,
    isNotificationOpen: false,
    loading: false
  };

  checkPasswordRegex = () => {
    const schema = new passwordValidator();
    schema
      .is()
      .min(8) // Minimum length 8
      .is()
      .max(100) // Maximum length 100
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits() // Must have digits
      .has()
      .not()
      .spaces(); // Should not have spaces

    if (schema.validate(this.state.newPassword, { list: true }) != "") {
      this.openNotification(
        "La contraseña no supera los parámetros requeridos",
        "error"
      );
    } else {
      this.updatePassword();
    }
  };

  returnValueNewPassword = async text => {
    await this.setState({
      newPassword: text.value
    });

    this.enableButton();
  };

  returnValueRepeatPassword = async text => {
    await this.setState({
      newPasswordRepeat: text.value
    });

    this.enableButton();
  };

  //If the form is filled correctly, enable "CREATE" button
  enableButton = async () => {
    if (this.state.newPassword != "" && this.state.newPasswordRepeat != "") {
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

  validatePassword = () => {
    if (this.state.newPassword == this.state.newPasswordRepeat) {
      this.checkPasswordRegex();
    } else {
      this.openNotification(
        "Las contraseña no coincide en ambos campos",
        "error"
      );
    }
  };

  //Sleep in miliseconds
  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  updatePassword = () => {
    switch (this.props.location.state.role[0]) {
      case "admin":
        AdminApi.update({
          id: this.props.location.state.id,
          password: this.state.newPassword
        })
          .then(response => {
            this.openNotification(
              "La contraseña ha sido actualizada con exito.",
              "success"
            );
            this.sleep(1500).then(() => {
              this.props.history.push("/filemng");
            });
          })
          .catch(e => {
            console.log(e);
          });

        break;
      case "client":
        ClientApi.update({
          id: this.props.location.state.id,
          password: this.state.newPassword
        })
          .then(response => {
            this.openNotification(
              "La contraseña ha sido actualizada con exito.",
              "success"
            );
            this.sleep(1500).then(() => {
              this.props.history.push("/filemng");
            });
          })
          .catch(e => {
            console.log(e);
          });
        break;
      case "user":
        UserApi.update({
          id: this.props.location.state.id,
          password: this.state.newPassword
        })
          .then(response => {
            this.openNotification(
              "La contraseña ha sido actualizada con exito.",
              "success"
            );
            this.sleep(1500).then(() => {
              this.props.history.push("/filemng");
            });
          })
          .catch(e => {
            console.log(e);
          });
        break;
    }
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

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Notification
          message={this.state.notificationText}
          type={this.state.notificationType}
          handleNotificationOpen={this.state.isNotificationOpen}
          handleNotificationClose={this.closeNotification}
        />
        <Paper className={classes.paper}>
          <Grid container spacing={24} style={{ margin: 0, width: "100%" }}>
            <Grid item xs={7}>
              {!this.state.loading && (
                <div style={{ width: "100%", marginTop: 40 }}>
                  <Typography variant="caption" style={{ fontSize: 14 }}>
                    {" "}
                    La contraseña debe contener por lo menos 8 caracteres, una
                    mayúscula, una minúscula y un número{" "}
                  </Typography>{" "}
                  <div style={{ margin: 10 }} />
                  <InputPassword
                    label="Nueva contraseña"
                    returnValue={this.returnValueNewPassword}
                  />
                  <div style={{ margin: 10 }} />
                  <InputPassword
                    label="Repetir nueva contraseña"
                    returnValue={this.returnValueRepeatPassword}
                  />
                  <Button
                    variant="outlined"
                    style={{
                      marginTop: 20,
                      color: this.state.createColor,
                      backgroundColor: this.state.buttonBackground
                    }}
                    onClick={() => this.validatePassword()}
                  >
                    {" "}
                    Cambiar contraseña
                  </Button>
                </div>
              )}
              {this.state.loading && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: 15,
                    marginTop: 140
                  }}
                >
                  {" "}
                  <MetroSpinner size={50} color="#6AD59F" loading={true} />
                </div>
              )}
            </Grid>

            <Grid
              item
              xs={5}
              style={{
                backgroundColor: "#A9BCD0",
                minHeight: "40vh",
                padding: 0,
                margin: 0,
                borderTopRightRadius: 15,
                borderBottomRightRadius: 15
              }}
            >
              <ColorConsumer>
                {({ color }) => (
                  <div
                    className={classes.image}
                    style={{ backgroundColor: color }}
                  />
                )}
              </ColorConsumer>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

ChangePassword.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ChangePassword);
