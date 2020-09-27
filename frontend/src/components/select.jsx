import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%"
  },
  formControl: {
    minWidth: 150,
    width: "100%"
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  }
});

class SimpleSelect extends React.Component {
  state = {
    selectedItem: this.props.value || "",
    name: "items",
    labelWidth: 0
  };

  componentDidMount = () => {
    this.setState({
      labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth
    });
  };

  handleChange = event => {
    this.setState({ selectedItem: event.target.value });
    this.props.selectedValue(event.target.value);
  };

  render() {
    const { classes } = this.props;

    return (
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel
          ref={ref => {
            this.InputLabelRef = ref;
          }}
          htmlFor="outlined-tags-simple"
        >
          {this.props.label}
        </InputLabel>
        <Select
          value={this.state.selectedItem}
          onChange={this.handleChange}
          input={
            <OutlinedInput
              inputProps={{ tabIndex: this.props.tabIndex }}
              style={{ float: "left" }}
              labelWidth={this.state.labelWidth}
              name="items"
              id="outlined-items-simple"
            />
          }
        >
          {this.props.departmentList.map(department => {
            return (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  }
}

SimpleSelect.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SimpleSelect);
