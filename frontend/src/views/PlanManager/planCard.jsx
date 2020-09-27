import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";

import DeleteIcon from "@material-ui/icons/DeleteOutlined";
import EditIcon from "@material-ui/icons/CreateOutlined";
import Tooltip from "@material-ui/core/Tooltip";

//Context
import { ColorConsumer } from "../../context/colorContext";

const bgImge =
  '"' +
  "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.78' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E" +
  '"';

const styles = {
  root: {
    backgroundImage: "url(" + bgImge + ")",
    paddingBottom: 2,
    paddingTop: 2,
    borderRadius: 5,
    margin: 10,
    minWidth: 300,
    maxWidth: 300
  },
  card: {
    margin: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 500
  },
  pos: {
    marginBottom: 0,
    fontSize: 14,
    fontWeight: 500
  },
  actions: {
    display: "flex",
    justifyContent: "center"
  },
  buttons: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    marginLeft: 5,
    marginRight: 5
  }
};

class PlanCard extends React.Component {
  state = {
    id: this.props.id
  };
  handleDelete = () => {
    this.props.onDelete(this.state.id);
  };

  handleEdit = () => {
    this.props.onEdit(this.state.id);
  };

  render() {
    const { classes } = this.props;
    return (
      <ColorConsumer>
        {({ color }) => (
          <div className={classes.root} style={{ backgroundColor: color }}>
            <Card className={classes.card}>
              <CardContent style={{ paddingBottom: 0 }}>
                <Typography
                  className={classes.title}
                  variant="h5"
                  component="h2"
                  color="textPrimary"
                >
                  {this.props.description}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  {this.props.quote + "GB"}
                </Typography>
              </CardContent>
              <CardActions className={classes.actions}>
                <Tooltip title="Editar">
                  <IconButton
                    aria-label="Edit"
                    className={classes.buttons}
                    onClick={this.handleEdit}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton
                    onClick={this.handleDelete}
                    aria-label="Delete"
                    className={classes.buttons}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </div>
        )}
      </ColorConsumer>
    );
  }
}

PlanCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PlanCard);
