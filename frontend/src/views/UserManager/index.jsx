import React from "react";

//Material UI
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

//Self made components
import DeleteModal from "./modals/deleteModal";
import Input from "../../components/input";
import ClientCard from "../../components/clientCard";
import Notification from "../../components/notification";

//Icons
import ClientIcon from "@material-ui/icons/WorkOutline";
import UserIcon from "@material-ui/icons/Face";
import CancelIcon from "@material-ui/icons/CancelOutlined";

//Api
import ClientsApi from "../../api/clients";
import UsersApi from "../../api/users";

//Context
import { ColorConsumer } from "../../context/colorContext";

//Routing
import { Link } from "react-router-dom";

// Styles applied with classes
const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 1.5,
    textAlign: "center",
    backgroundColor: "white",
    color: theme.palette.text.secondary
  },
  formContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%"
  }
});

class UserManager extends React.Component {
  state = {
    clientList: [],
    clientUserList: [],
    hasPendingUsers: [],
    selectedClient: "",
    isViewModalOpen: false,
    selectedUser: "",
    clientCifnif: "",
    filterActive: false,
    isNotificationOpen: false
  };

  /**
   * Refresh list when a user is accepted
   * @param {number} id: ID of the accepted user
   */

  refreshClientData = id => {
    ClientsApi.getAll()
      .then(response => {
        this.setState({
          clientList: response
        });

        this.hasPendingUsers();
      })
      .then(response => {
        const selectedClient = this.state.clientList.find(client => {
          return client.id === this.state.selectedClient.id;
        });
        this.setState({
          selectedClient: selectedClient
        });
      })
      .then(response => {
        const selectedUser = this.state.selectedClient.users.find(user => {
          return user.id === id;
        });

        this.setState({
          selectedUser: selectedUser
        });
      });
  };

  //Clean search filters
  cleanFilter = () => {
    ClientsApi.getAll()
      .then(response => {
        this.setState({
          clientList: response,
          filterActive: false
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  // Initial API call for the list of clients
  getClientData = () => {
    ClientsApi.getAll()
      .then(response => {
        this.setState({
          clientList: response
        });

        this.hasPendingUsers();
      })
      .catch(e => {
        console.log(e);
      });
  };

  //Api request for clients
  componentDidMount = () => {
    this.getClientData();
  };

  //Search clients by CIFNIF
  searchByCifnif = () => {
    ClientsApi.getAll({ cifnif: this.state.clientCifnif })
      .then(response => {
        this.setState({
          clientList: response,
          filterActive: true
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  //If the client has pending users, change the background color to yellow
  hasPendingUsers = () => {
    this.setState({
      hasPendingUsers: []
    });
    this.state.clientList.forEach(client => {
      client.users.forEach(user => {
        if (user.status === "pending") {
          let auxArray = this.state.hasPendingUsers;
          auxArray.push(client.id);

          this.setState({
            hasPendingUsers: auxArray
          });
        }
      });
    });
  };

  /**
   * Find users for the selected client
   * @param {number} id: ID of the selected client
   */
  selectUsers = id => {
    const selectedClient = this.state.clientList.find(client => {
      return client.id === id;
    });

    this.setState({
      clientUserList: selectedClient.users,
      selectedClient: selectedClient
    });
  };

  /**
   * Open modal and ask for user response
   * @param {number} id: ID of the user/client to be deleted
   * @param {boolean} isUser: Is it a user or a client being deleted?
   */
  prepareForDetele = (id, isUser) => {
    if (isUser) {
      const selectedUser = this.state.selectedClient.users.find(user => {
        return user.id === id;
      });

      if (this.state.selectedUser === "") {
        this.setState({
          selectedUser: selectedUser
        });
      }
    } else {
      const selectedClient = this.state.clientList.find(client => {
        return client.id === id;
      });

      this.setState({
        selectedClient: selectedClient
      });
    }

    this.openModal();
  };

  /**
   * Delete user/client
   * @param {number} id: ID of the user/client to be deleted
   * @param {boolean} isUser: Is it a user or a client being deleted?
   */
  deleteClient = async (id, isUser) => {
    let auxArray;

    if (isUser) {
      auxArray = this.state.clientUserList;

      auxArray.forEach(element => {
        if (element.id === id) {
          UsersApi.delete(element.id)
            .then(response => {
              this.openNotification(response.toString(), "success");
            })
            .then(() => {
              auxArray.splice(auxArray.indexOf(element), 1);

              this.getClientData();

              this.setState({
                isViewModalOpen: false,
                selectedUser: "",
                clientUserList: auxArray
              });
            })
            .catch(e => {
              this.openNotification(e.toString(), "error");
            });
        }
      });

      this.closeModal();

      this.hasPendingUsers();
    } else {
      auxArray = this.state.clientList;

      auxArray.forEach(element => {
        if (element.id === id) {
          ClientsApi.delete(element.id)
            .then(response => {
              this.openNotification(response.toString(), "success");
            })
            .then(() => {
              auxArray.splice(auxArray.indexOf(element), 1);
              this.setState({
                selectedClient: "",
                clientList: auxArray,
                isViewModalOpen: false,
                clientUserList: []
              });
            })
            .catch(e => {
              this.openNotification(
                e.response.data.error.error.toString(),
                "error"
              );
            });
        }
      });

      this.closeModal();
    }
  };

  handleInputValue = input => {
    this.setState({
      clientCifnif: input.value
    });
  };

  openModal = () => {
    this.setState({
      isViewModalOpen: true
    });
  };

  closeModal = () => {
    this.setState({
      isViewModalOpen: false
    });
  };

  closeNotification = () => {
    this.setState({
      isNotificationOpen: false
    });
  };

  /**
   * Open snackbar notification
   * @param {string} text: Message showed in the snackbar
   * @param {string} type: Error, success, warning, etc-
   */
  openNotification = (text, type) => {
    this.setState({
      isNotificationOpen: true,
      notificationText: text,
      notificationType: type
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <DeleteModal
          handleModalOpen={this.state.isViewModalOpen}
          handleModalNo={this.closeModal}
          handleModalYes={this.deleteClient}
          selected={
            this.state.selectedUser !== ""
              ? this.state.selectedUser
              : this.state.selectedClient
          }
        />
        <Notification
          message={this.state.notificationText}
          type={this.state.notificationType}
          handleNotificationOpen={this.state.isNotificationOpen}
          handleNotificationClose={this.closeNotification}
        />

        {/* Header */}
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant="h2">Gestión de usuarios</Typography>
          </Grid>

          {/* Clients & Users */}
          <Grid item xs={9}>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item className={classes.paper} xs={6}>
                  <Typography
                    variant="caption"
                    gutterBottom
                    style={{
                      textAlign: "left",
                      paddingTop: 0,
                      color: "#A3A3A3"
                    }}
                  >
                    <ClientIcon
                      style={{
                        paddingTop: 0,
                        verticalAlign: "sub"
                      }}
                    />{" "}
                    CLIENTES
                    {this.state.filterActive && (
                      <IconButton
                        color="primary"
                        style={{
                          float: "right",
                          margin: 4,
                          padding: 2
                        }}
                        onClick={() => {
                          this.cleanFilter();
                        }}
                      >
                        <CancelIcon />{" "}
                      </IconButton>
                    )}
                  </Typography>

                  <Paper
                    square={true}
                    elevation={0}
                    style={{
                      padding: "15px",
                      backgroundColor: "#F6F6F6",
                      overflowY: "scroll",
                      maxHeight: "600px"
                    }}
                  >
                    {/* Client list */}
                    <Grid container spacing={16}>
                      {this.state.clientList.map(client => {
                        return (
                          <Grid item xs={12}>
                            <div
                              style={{
                                margin: 0,
                                padding: 0,
                                borderColor: "#FAE279",
                                borderWidth: 3,
                                zIndex: 1500,
                                borderRadius: "4px",
                                borderStyle:
                                  client.id === this.state.selectedClient.id
                                    ? "solid"
                                    : "none"
                              }}
                            >
                              <ClientCard
                                returnId={this.selectUsers}
                                delete={this.prepareForDetele}
                                key={client.id}
                                data={client}
                                isUser={false}
                                isPending={this.state.hasPendingUsers}
                              />
                            </div>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                  <ColorConsumer>
                    {({ color }) => (
                      <Link to="/newclient">
                        <Button
                          variant="outlined"
                          style={{
                            marginTop: "10px",
                            float: "right",
                            color,
                            borderColor: color
                          }}
                        >
                          Crear nuevo cliente
                        </Button>
                      </Link>
                    )}
                  </ColorConsumer>
                </Grid>
                <Grid item className={classes.paper} xs={6}>
                  <Typography
                    variant="caption"
                    gutterBottom
                    style={{
                      textAlign: "left",

                      color: "#A3A3A3"
                    }}
                  >
                    <UserIcon
                      style={{
                        paddingTop: 0,
                        verticalAlign: "sub"
                      }}
                    />
                    USUARIOS
                    {this.state.selectedClient !== ""
                      ? ` (${this.state.selectedClient.company})`
                      : " (Seleccionar un cliente)"}
                  </Typography>
                  <Paper
                    square={true}
                    elevation={0}
                    style={{
                      padding: "15px",
                      backgroundColor: "#F6F6F6",
                      overflowY: "scroll",
                      maxHeight: "600px"
                    }}
                  >
                    {/* User list */}
                    <Grid container spacing={16}>
                      {this.state.clientUserList.map(user => {
                        return (
                          <Grid item xs={12}>
                            <ClientCard
                              key={user.id}
                              data={user}
                              isUser={true}
                              delete={this.prepareForDetele}
                              refresh={this.refreshClientData}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                  {this.state.selectedClient !== "" ? (
                    <ColorConsumer>
                      {({ color }) => (
                        <Link
                          to={{
                            pathname: "/newuser",
                            state: { id: this.state.selectedClient.id }
                          }}
                        >
                          <Button
                            variant="outlined"
                            style={{
                              marginTop: "10px",
                              float: "right",
                              color,
                              borderColor: color
                            }}
                          >
                            {`Crear nuevo usuario para ${
                              this.state.selectedClient.company
                            }`}
                          </Button>
                        </Link>
                      )}
                    </ColorConsumer>
                  ) : (
                    ""
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Utilities */}
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <form
                className={classes.formContainer}
                noValidate
                autoComplete="off"
              >
                <Input
                  returnValue={this.handleInputValue}
                  name="cifnifSearch"
                  label="CIFNIF de cliente"
                />
              </form>
              <ColorConsumer>
                {({ color }) => (
                  <Button
                    variant="outlined"
                    style={{ marginTop: "10px", color, borderColor: color }}
                    onClick={() => this.searchByCifnif()}
                  >
                    {" "}
                    Buscar
                  </Button>
                )}
              </ColorConsumer>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

UserManager.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UserManager);
