import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import FieldIcon from "@material-ui/icons/DashboardOutlined";

const styles = theme => ({
  root: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  chip: {
    margin: theme.spacing.unit
  }
});

class OutlinedChips extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Chip
          id={this.props.tempId}
          icon={<FieldIcon />}
          label={this.props.label}
          className={classes.chip}
          variant="outlined"
        />
      </div>
    );
  }
}

OutlinedChips.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OutlinedChips);
