import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Typography from "@material-ui/core/Typography";
import StarIcon from "@material-ui/icons/Star";
import UserManageIcon from "@material-ui/icons/SupervisedUserCircle";
import TableIcon from "@material-ui/icons/FormatAlignJustify";
import PasswordIcon from "@material-ui/icons/VpnKey";
import LogOutIcon from "@material-ui/icons/PowerSettingsNew";
import ApiConfig from "../api/config";
import ApiClient from "../api/clients";
import ApiUser from "../api/users";
import ApiAdmin from "../api/admin";
import { Link } from "react-router-dom";
import { ColorConsumer } from "../context/colorContext";

import Background from "../img/stripes-light.png";

const drawerWidth = 64;

const styles = theme => ({
  root: {
    display: "flex"
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    height: drawerWidth + 1,
    width: "100%",

    boxShadow: "0px 0px 0px",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    flexFlow: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth,
    display: "flex",
    justifyContent: "center",
    overflow: "hidden"
  },
  content: {
    flexGrow: 1,
    margin: "5px 30px 5px 30px",
    padding: theme.spacing.unit * 3
  },
  toolbar: {
    ...theme.mixins.toolbar
  },
  listItem: {
    marginBottom: "5px",
    marginTop: "5px",
    fontSize: "25px"
  },
  avatar: {
    width: 45,
    height: 45
  }
});

class ClippedDrawer extends React.Component {
  state = {
    userRole: null,
    userRoleID: null,
    userText: ""
  };

  componentWillMount = async () => {
    await this.setState({
      userRole: await ApiConfig.getUser(),
      userRoleID: await ApiConfig.getId()
    });
    this.getUserText();
  };

  getUserText = () => {
    if (this.state.userRole[0] === "admin") {
      ApiAdmin.getById(this.state.userRoleID).then(response => {
        this.setState({
          userText: response.email
        });
      });
    } else if (this.state.userRole[0] === "client") {
      ApiClient.getById(this.state.userRoleID).then(response => {
        this.setState({
          userText: response.email
        });
      });
    } else if (this.state.userRole[0] === "user") {
      ApiUser.getById(this.state.userRoleID).then(response => {
        this.setState({
          userText: response.email
        });
      });
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <ColorConsumer>
          {({ color, avatar }) => (
            <AppBar
              position="fixed"
              className={classes.appBar}
              style={{ backgroundColor: color }}
            >
              <Link
                to="/filemng"
                style={{ marginLeft: 10, marginRight: "auto" }}
              >
                <img src={avatar} className={classes.avatar} />
              </Link>

              {/* <NotificationIcon
            color="primary"
            style={{ fontSize: "30px", marginRight: 40 }}
          /> */}
              <Typography
                variant="caption"
                style={{
                  marginRight: 20,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "white"
                }}
              >
                {this.state.userText}
              </Typography>
            </AppBar>
          )}
        </ColorConsumer>

        <ColorConsumer>
          {({ color }) => (
            <Drawer
              className={classes.drawer}
              variant="permanent"
              classes={{
                paper: classes.drawerPaper
              }}
            >
              <List>
                <div>
                  <Link to="/filemng">
                    <ListItem button key={"home"}>
                      <ListItemIcon>
                        <TableIcon
                          style={{ color }}
                          className={classes.listItem}
                        />
                      </ListItemIcon>
                    </ListItem>
                  </Link>

                  {this.state.userRole == "admin" && (
                    <Link to="/usermng">
                      <ListItem
                        button
                        key={"usrMng"}
                        className={classes.listItem}
                      >
                        <ListItemIcon>
                          <UserManageIcon
                            style={{ color }}
                            className={classes.listItem}
                          />
                        </ListItemIcon>
                      </ListItem>
                    </Link>
                  )}

                  {this.state.userRole == "admin" && (
                    <Link to="/plans">
                      <ListItem
                        button
                        key={"plans"}
                        className={classes.listItem}
                      >
                        <ListItemIcon>
                          <StarIcon
                            style={{ color }}
                            className={classes.listItem}
                          />
                        </ListItemIcon>
                      </ListItem>
                    </Link>
                  )}

                  {this.state.userRole == "client" && (
                    <Link
                      to={{
                        pathname: "/newuser",
                        state: { id: this.state.userRoleID }
                      }}
                    >
                      <ListItem
                        button
                        key={"usrMng"}
                        className={classes.listItem}
                      >
                        <ListItemIcon>
                          <UserManageIcon
                            style={{ color }}
                            className={classes.listItem}
                          />
                        </ListItemIcon>
                      </ListItem>
                    </Link>
                  )}

                  <Link
                    to={{
                      pathname: "/changepassword",
                      state: {
                        id: this.state.userRoleID,
                        role: this.state.userRole
                      }
                    }}
                  >
                    <ListItem button key={"home"}>
                      <ListItemIcon>
                        <PasswordIcon
                          style={{ color }}
                          className={classes.listItem}
                        />
                      </ListItemIcon>
                    </ListItem>
                  </Link>
                </div>
                <div>
                  <Link to="/">
                    <ListItem button key={"exit"} className={classes.listItem}>
                      <ListItemIcon>
                        <LogOutIcon
                          style={{ color: "#B2373F" }}
                          className={classes.listItem}
                        />
                      </ListItemIcon>
                    </ListItem>
                  </Link>
                </div>
              </List>
            </Drawer>
          )}
        </ColorConsumer>
        <div
          style={{
            backgroundImage: "url(" + Background + ")",
            position: "fixed",
            top: 0,
            left: 32,
            width: "100%",
            height: "100%",
            overflow: "auto"
          }}
        >
          <main className={classes.content}>
            <div className={classes.toolbar} />
            {this.props.children}
          </main>
        </div>
      </div>
    );
  }
}

ClippedDrawer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ClippedDrawer);
