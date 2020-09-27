import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";

const styles = {
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fafafa"
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4
  }
};

function CustomizedInputBase(props) {
  const { classes } = props;
  let searchValue = "";
  let searchComponent = null;
  return (
    <Paper
      className={classes.root}
      style={{ height: props.size || "40px" }}
      elevation={1}
    >
      <InputBase
        onChange={e => {
          searchValue = e.target.value;
          searchComponent = e.target;
        }}
        className={classes.input}
        placeholder={props.placeholder}
      />

      <Divider className={classes.divider} />
      <IconButton
        className={classes.iconButton}
        aria-label="Search"
        onClick={() => {
          props.returnValue(searchValue);
          if (searchComponent != null) {
            searchComponent.value = "";
          }
        }}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

CustomizedInputBase.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CustomizedInputBase);
