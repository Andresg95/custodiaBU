import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

const styles = theme => ({
  textField: {
    width: "100%",
    backgroundColor: "#fafafa",
    marginTop: 10
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  }
});

class InputPassword extends React.Component {
  state = {
    password: "",
    showPassword: false
  };

  handleChange = event => {
    this.props.returnValue(event.target);
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  render() {
    const { classes } = this.props;

    return (
      <TextField
        id="outlined-adornment-password"
        className={classes.textField}
        variant="outlined"
        type={this.state.showPassword ? "text" : "password"}
        label={this.props.label}
        onChange={this.handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Toggle password visibility"
                onClick={this.handleClickShowPassword}
              >
                {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    );
  }
}

InputPassword.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(InputPassword);
