import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";

import IconButton from "@material-ui/core/IconButton";

import DeleteIcon from "@material-ui/icons/DeleteOutlined";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";

//Context
import { ColorConsumer } from "../../../../context/colorContext";

const bgImge =
  '"' +
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.78' fill-rule='evenodd'/%3E%3C/svg%3E" +
  '"';

// Styles applied with classes
const styles = {
  card: {
    width: "100%",
    height: "20%"
  },
  title: {
    fontSize: 14
  },
  cover: {
    width: "100%",
    height: "50px",
    backgroundSize: "cover",
    backgroundImage: "url(" + bgImge + ")"
  },
  actions: {
    display: "block",
    paddingTop: 6,
    marginTop: 0
  },
  buttons: {
    padding: "3px",
    paddingTop: "6px"
  },
  cardContent: {
    height: "50px",
    margin: 0,
    padding: 9,
    paddingLeft: 15,
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    paddingBottom: 0
  }
};

class clientCard extends React.Component {
  state = {};

  //Return client_id on click
  handleClick = () => {
    this.props.returnDepartment(this.props.department);
  };

  handleDelete = () => {
    this.props.delete(this.props.department.id);
  };

  render() {
    const { classes } = this.props;

    return (
      <Card
        className={classes.card}
        style={{ borderStyle: this.state.borderStyle }}
      >
        <div>
          <CardActionArea onClick={this.handleClick}>
            <Grid container>
              <Grid item xs={2}>
                <ColorConsumer>
                  {({ color }) => (
                    <div className={classes.imageBackground}>
                      <CardMedia
                        style={{ backgroundColor: color }}
                        className={classes.cover}
                      />
                    </div>
                  )}
                </ColorConsumer>
              </Grid>
              <Grid item xs={6}>
                <CardContent
                  className={classes.cardContent}
                  style={{ paddingBottom: 9 }}
                >
                  <Typography
                    variant="h5"
                    component="h2"
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#757369",
                      width: "100%"
                    }}
                  >
                    {this.props.department.name}
                  </Typography>
                </CardContent>
              </Grid>
              <Grid item xs={4}>
                <CardActions className={classes.actions}>
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
              </Grid>
            </Grid>
          </CardActionArea>
        </div>
      </Card>
    );
  }
}

clientCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(clientCard);
