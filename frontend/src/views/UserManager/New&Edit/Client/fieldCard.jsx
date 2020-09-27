import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";

import IconButton from "@material-ui/core/IconButton";

import ViewIcon from "@material-ui/icons/VisibilityOutlined";
import RequiredIcon from "@material-ui/icons/NewReleasesOutlined";
import DeleteIcon from "@material-ui/icons/DeleteOutlined";
import SaveIcon from "@material-ui/icons/SaveOutlined";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import MenuItem from "@material-ui/core/MenuItem";
import EditIcon from "@material-ui/icons/CreateOutlined";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";

//Context
import { ColorConsumer } from "../../../../context/colorContext";

import Grid from "@material-ui/core/Grid";

const bgImge =
  '"' +
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.78' fill-rule='evenodd'/%3E%3C/svg%3E" +
  '"';

// Styles applied with classes
const styles = {
  card: {
    width: "100%",
    height: "50px"
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
    textAlign: "left"
  }
};

class fieldCard extends React.Component {
  state = {
    edit: false,
    name: "",
    type: ""
  };

  componentDidMount() {
    this.setState({
      name: this.props.field.name,
      type: this.props.field.type
    });
  }

  handleDelete = () => {
    this.props.delete(this.props.field.id);
  };
  handleVisibility = () => {
    this.props.visibility(this.props.field.id);
  };
  handleRequired = () => {
    this.props.required(this.props.field.id);
  };

  save = () => {
    const { name, type } = this.state;
    this.props.editDepartment(
      this.props.index,
      { name, type },
      this.props.field
    );
    this.setState({ edit: false });
  };

  render() {
    const { classes } = this.props;
    const { edit } = this.state;

    return (
      <Card
        className={classes.card}
        style={{
          borderStyle: this.state.borderStyle,
          height: edit ? 150 : null
        }}
      >
        <div>
          <Grid container>
            <Grid item xs={2}>
              <ColorConsumer>
                {({ color }) => (
                  <div className={classes.imageBackground}>
                    <CardMedia
                      style={{
                        backgroundColor: color,
                        height: edit ? 150 : null
                      }}
                      className={classes.cover}
                    />
                  </div>
                )}
              </ColorConsumer>
            </Grid>
            <Grid item xs={6}>
              <CardContent
                className={classes.cardContent}
                style={{ height: 80 }}
              >
                {!edit ? (
                  <>
                    <Typography
                      variant="h5"
                      component="h2"
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#757369",
                        width: "100%"
                      }}
                    >
                      {this.props.field.name}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      style={{ fontSize: "11px", width: "100%" }}
                    >
                      {this.props.field.type}
                    </Typography>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <TextField
                      name={"newFieldName"}
                      label={"Nombre del campo"}
                      style={{ width: "100%", margin: 10 }}
                      onChange={e => this.setState({ name: e.target.value })}
                      margin="normal"
                      variant="outlined"
                      value={this.state.name}
                    />

                    <FormControl
                      variant="outlined"
                      style={{
                        width: "100%"
                      }}
                    >
                      <InputLabel
                        ref={ref => {
                          this.InputLabelRef = ref;
                        }}
                        htmlFor="outlined-tags-simple"
                      >
                        Tipo
                      </InputLabel>
                      <Select
                        value={this.state.type}
                        onChange={event =>
                          this.setState({ type: event.target.value })
                        }
                        input={
                          <OutlinedInput
                            value={this.props.type}
                            style={{ width: "100%" }}
                            name="items"
                            id="outlined-items-simple"
                          />
                        }
                      >
                        <MenuItem value="" />
                        <MenuItem value={"número"}>Número</MenuItem>
                        <MenuItem value={"fecha"}>Fecha</MenuItem>
                        <MenuItem value={"texto"}>Texto</MenuItem>
                        <MenuItem value={"alfanumérico"}>Alfanumérico</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                )}
              </CardContent>
            </Grid>

            <Grid item xs={4}>
              <CardActions className={classes.actions}>
                <Tooltip title="Campo visible">
                  <IconButton
                    onClick={this.handleVisibility}
                    aria-label="Delete"
                    className={classes.buttons}
                  >
                    <ColorConsumer>
                      {({ color }) => (
                        <ViewIcon
                          style={{
                            color: this.props.field.is_visible
                              ? color
                              : "#757575"
                          }}
                        />
                      )}
                    </ColorConsumer>
                  </IconButton>
                </Tooltip>
                {!this.props.editable && (
                  <Tooltip title="Campo requerido">
                    <IconButton
                      onClick={this.handleRequired}
                      aria-label="Delete"
                      className={classes.buttons}
                    >
                      <ColorConsumer>
                        {({ color }) => (
                          <RequiredIcon
                            style={{
                              color: this.props.field.is_required
                                ? color
                                : "#757575"
                            }}
                          />
                        )}
                      </ColorConsumer>
                    </IconButton>
                  </Tooltip>
                )}
                {!this.props.editable && (
                  <Tooltip title="Eliminar">
                    <IconButton
                      onClick={this.handleDelete}
                      aria-label="Delete"
                      className={classes.buttons}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {!edit ? (
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => this.setState({ edit: !edit })}
                      aria-label="Edit"
                      className={classes.buttons}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Guardar">
                    <IconButton
                      onClick={() => this.save()}
                      aria-label="Edit"
                      className={classes.buttons}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Grid>
          </Grid>
        </div>
      </Card>
    );
  }
}

fieldCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(fieldCard);
