import "date-fns";
import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "material-ui-pickers";


const styles = theme => ({
  grid: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },

});

class MaterialUIPickers extends React.Component {
  state = {
    // The first commit of Material-UI
    selectedDate: null
  };

  handleDateChange = date => {
    this.setState({ selectedDate: date });
    this.props.returnValue(date);
  };

  render() {
    const { classes } = this.props;
    const { selectedDate } = this.state;


    
    
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container className={classes.grid} justify="space-around">
          <DatePicker
            style={{ width: "100%" }}

            keyboard
            variant="outlined"
            label={this.props.label}
            format="dd/MM/yyyy"
            placeholder="10/10/2018"
            mask={value =>
              // handle clearing outside if value can be changed outside of the component
              value
                ? [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]
                : []
            }
            value={selectedDate}
            onChange={this.handleDateChange}
            disableOpenOnEnter
            animateYearScrolling={false}
          />
        </Grid>
      </MuiPickersUtilsProvider>
    );
  }
}

MaterialUIPickers.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MaterialUIPickers);
