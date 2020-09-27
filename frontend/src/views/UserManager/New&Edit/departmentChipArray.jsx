import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Department from "../New&Edit/departmentChip";

const styles = theme => ({
  root: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    padding: theme.spacing.unit / 2,
    height: "60%",
    maxHeight: 160,
    overflowY: "scroll",
    backgroundColor: "#f6f6f6"
  },
  chip: {
    margin: theme.spacing.unit / 2
  }
});

class ChipsArray extends React.Component {
  state = {
    chipData: this.props.departments
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      chipData: nextProps.departments
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        {this.state.chipData.map(data => {
          return (
            <Department
              key={Math.random()}
              label={data.name}
              tempId={data.id}
            />
          );
        })}
      </Paper>
    );
  }
}

ChipsArray.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ChipsArray);
