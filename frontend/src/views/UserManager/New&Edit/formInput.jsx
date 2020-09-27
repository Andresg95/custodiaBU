import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import ValidateSpanishID from "../../../utils/validateSpanishID";

const styles = theme => ({
  textField: {
    width: "100%",
    backgroundColor: "#fafafa"
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  }
});

const VALIDATION_REGEX = {
  alphanumeric: /^[a-zA-Z0-9\s.,'-]*$/,
  text: "^[A-zÀ-ú ]*$",
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  numeric: "^(0|[1-9][0-9]*)$"
};

class Input extends React.Component {
  state = {
    name: this.props.name,
    value: "",
    error: false,
    helperText: ""
  };

  componentDidMount = () => {
    this.props.checkInputValidation(this.props.name, null, "");
  };

  validateForm = event => {
    let validationRegex;
    if (event.target.value !== "") {
      switch (this.props.type) {
        case 1:
          validationRegex = new RegExp(VALIDATION_REGEX.alphanumeric);
          if (validationRegex.test(event.target.value)) {
            return true;
          } else if (event.target.value.length > 255) {
            this.setState({
              error: true,
              helperText:
                "El valor del campo no puede contener más de 255 caracteres"
            });
            return false;
          } else {
            this.setState({
              error: true,
              helperText: "El valor del campo debe ser alfanumérico"
            });
            return false;
          }

        case 2:
          validationRegex = new RegExp(VALIDATION_REGEX.text);
          if (validationRegex.test(event.target.value)) {
            return true;
          } else if (event.target.value.length > 255) {
            this.setState({
              error: true,
              helperText:
                "El valor del campo no puede contener más de 255 caracteres"
            });
            return false;
          } else {
            this.setState({
              error: true,
              helperText: "El valor del campo debe ser texto (A-Z)"
            });
            return false;
          }

        case 3:
          if (VALIDATION_REGEX.email.test(event.target.value)) {
            return true;
          } else if (event.target.value.length > 50) {
            this.setState({
              error: true,
              helperText:
                "El valor del email no puede contener más de 50 caracteres"
            });
            return false;
          } else {
            this.setState({
              error: true,
              helperText: "El email no está correctamente formado (____@___.__)"
            });
            return false;
          }

        case 4:
          validationRegex = new RegExp(VALIDATION_REGEX.numeric);
          if (validationRegex.test(event.target.value)) {
            return true;
          } else if (event.target.value.length > 255) {
            this.setState({
              error: true,
              helperText:
                "El valor del campo no puede contener más de 255 caracteres"
            });
            return false;
          } else {
            this.setState({
              error: true,
              helperText: "El valor del campo debe ser numérico (0-9)"
            });
            return false;
          }

        case 5:
          if (ValidateSpanishID(event.target.value).valid) {
            return true;
          } else if (event.target.value.length > 255) {
            this.setState({
              error: true,
              helperText:
                "El valor del campo no puede contener más de 255 caracteres"
            });
            return false;
          } else {
            this.setState({
              error: true,
              helperText: "El NIF, NIE o CIF no está correctamente formado"
            });
            return false;
          }

        default:
          throw new Error("Este valor no está permitido");
        //Y al log
      }
    } else {
      if (this.props.name != "compañia") {
        this.setState({
          error: true,
          helperText: "El valor del campo no puede estar vacío"
        });
      } else {
        this.setState({
          error: false,
          helperText: ""
        });
      }
    }
  };

  //Form validation
  handleChange = event => {
    if (this.validateForm(event)) {
      this.setState({
        error: false,
        helperText: ""
      });

      this.props.checkInputValidation(
        this.props.name,
        true,
        event.target.value
      );
    } else {
      this.props.checkInputValidation(
        this.props.name,
        false,
        event.target.value
      );
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <TextField
        inputProps={{
          tabIndex: this.props.tabIndex
        }}
        name={this.props.name}
        helperText={this.state.helperText}
        error={this.state.error}
        id="outlined-with-placeholder"
        label={this.props.label}
        className={classes.textField}
        onChange={this.handleChange}
        margin="normal"
        variant="outlined"
        required={this.props.required}
        InputLabelProps={{ classes: classes.borderColor }}
      />
    );
  }
}

Input.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Input);
