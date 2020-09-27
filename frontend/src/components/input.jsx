import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

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

class Input extends React.Component {
  state = {};

  handleChange = event => {
    this.props.returnValue(event.target);
  };

  render() {
    const { classes } = this.props;

    return (
      <TextField
        name={this.props.name}
        id="outlined-with-placeholder"
        label={this.props.label}
        className={classes.textField}
        onChange={this.handleChange}
        margin="normal"
        variant="outlined"
        disabled={this.props.disabled ? this.props.disabled : false}
        value={this.props.defaultValue}
      />
    );
  }
}

Input.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Input);
