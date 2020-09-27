import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Background from "./img/notAuthWall.jpeg";



const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundImage: "url(" + Background + ")",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  }
});

class NotAuth extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
    

        <Typography variant="h1" component="h2" style={{ fontSize: "50px" }}>
          No tienes permiso para acceder a esta sección de <span>&nbsp;</span>
        </Typography>
        <Typography variant="h2" component="h2" style={{ fontSize: "50px" }}>
       

          Custodia Online
         
        </Typography>
      
       


      </div>
    );
  }
}

NotAuth.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NotAuth);
