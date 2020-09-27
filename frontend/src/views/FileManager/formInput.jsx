import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

var moment = require("moment");
moment().format();

const styles = theme => ({
  textField: {
    width: "80%",
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
    this.props.checkInputValidation(
      this.props.name,
      null,
      "",
      this.props.required
    );
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
              helperText:
                "El valor del campo debe ser alfanumérico (A-Z, 0-9, puntos y comas)"
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
          if (moment(event.target.value, "DD/MM/YYYY", true).isValid()) {
            return true;
          } else if (event.target.value.length > 10) {
            this.setState({
              error: true,
              helperText:
                "El valor del campo no puede contener más de 10 caracteres (DD/MM/AAAA)"
            });
            return false;
          } else {
            this.setState({
              error: true,
              helperText: "La fecha no está correctamente formada"
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

        default:
          throw new Error("Este valor no está permitido");
        //Y al log
      }
    } else {
      if (this.props.required) {
        this.setState({
          error: true,
          helperText: "El campo no puede estar vacio"
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
