import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

import Button from "@material-ui/core/Button";

import Notification from "./components/notification";
import Input from "./views/UserManager/New&Edit/formInput";
import InputPassword from "./components/passwordInput";
import { MetroSpinner } from "react-spinners-kit";

import AuthenticateApi from "./api/auth";
import KeyboardEventHandler from "react-keyboard-event-handler";

const bgImge =
  '"' +
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23ffffff' fill-opacity='1' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E" +
  '"';
const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#FAFAFA",
    height: "100vh",
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

    backgroundColor: "#f5f5f5",
    backgroundImage: `url(
      ${bgImge}
    ), linear-gradient(60deg, #1D976C, #93F9B9)`
  }
});

// Input validation types
const VALIDATION_TYPE = {
  alphanumeric: 1,
  text: 2,
  email: 3,
  numeric: 4
};

class Login extends React.Component {
  state = {
    isInputValidated: [],
    password: "",
    createColor: "#9D9D9D",
    buttonBackground: "#E2E2E2",
    isButtonDisabled: true,
    isNotificationOpen: false,
    loading: false
  };

  checkInputValidation = (name, isValidated, value) => {
    let inputObject = {
      name: name,
      isValidated: isValidated,
      value: value
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

  returnValuePassword = async text => {
    await this.setState({
      password: text.value
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

    if (
      auxArray.length === this.state.isInputValidated.length &&
      this.state.password !== ""
    ) {
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

  buildAuthObject = () => {
    const [email] = this.state.isInputValidated;

    const authObject = {
      email: email.value,
      password: this.state.password
    };

    this.auth(authObject);
  };

  auth = async loginData => {
    await this.setState({
      loading: true
    });
    AuthenticateApi.authenticate(loginData)
      .then(async response => {
        await this.setState({
          loading: false
        });
        this.props.history.push("/filemng");
        this.props.updateUser();
      })
      .catch(e => {
        this.openNotification(e.response.data.error.error, "error");
        this.setState({
          loading: false
        });
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

  isEmailEmpty = () => {
    const [email] = this.state.isInputValidated;

    if (email && email.value !== "") {
      const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      return !emailRegex.test(email.value);
    } else {
      return true;
    }
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
        <KeyboardEventHandler
          handleKeys={["enter"]}
          onKeyEvent={(key, e) => this.buildAuthObject()}
        />
        <Paper className={classes.paper}>
          <Grid container spacing={24} style={{ margin: 0, width: "100%" }}>
            <Grid item xs={7}>
              {!this.state.loading && (
                <div style={{ width: "100%", marginTop: 70 }}>
                  <Input
                    checkInputValidation={this.checkInputValidation}
                    type={VALIDATION_TYPE.email}
                    name="email"
                    label="Email"
                    required={true}
                  />
                  <InputPassword
                    label="Contraseña"
                    returnValue={this.returnValuePassword}
                  />

                  <Button
                    variant="outlined"
                    style={{
                      marginTop: 20,
                      color: this.state.createColor,
                      backgroundColor: this.state.buttonBackground
                    }}
                    disabled={this.state.isButtonDisabled}
                    onClick={() => this.buildAuthObject()}
                  >
                    {" "}
                    Entrar
                  </Button>
                  <br />
                  <Button
                    style={{
                      marginTop: 10,
                      color: this.isEmailEmpty() ? "lightgrey" : "black",
                      backgroundColor: "rgb(251, 251, 252)"
                    }}
                    disabled={this.isEmailEmpty()}
                    onClick={() => {
                      const [email] = this.state.isInputValidated;

                      const emailRegex = AuthenticateApi.recoverPassword({
                        email: email.value
                      })
                        .then(response => {
                          this.openNotification(
                            "Se enviará un correo con su nueva contraseña en unos momentos",
                            "warning"
                          );
                        })
                        .catch(e => {
                          this.openNotification(
                            e.response.data.error.error,
                            "error"
                          );
                        });
                    }}
                  >
                    {" "}
                    He olvidado mi password
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
              <div className={classes.image} />
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);
