import React from "react";
import Login from "./Login";
import FileManager from "./views/FileManager";
import PlanManager from "./views/PlanManager";
import UserManager from "./views/UserManager";
import SwaggerTest from "./components/SwaggerTest";
import Footer from "./components/Footer";

import ChangePassword from "./changePassword";

import newUser from "./views/UserManager/New&Edit/User/newUser";
import editUser from "./views/UserManager/New&Edit/User/editUser";
import ApiConfig from "./api/config";

import NewClient from "./views/UserManager/New&Edit/Client/newClient";
import NewDepartments from "./views/UserManager/New&Edit/Client/departments&Fields";
import ConfirmClient from "./views/UserManager/New&Edit/Client/confirmClient";

import EditClient from "./views/UserManager/New&Edit/Client/editClient";
import EditDepartments from "./views/UserManager/New&Edit/Client/editDepartments&Fields";
import ConfirmEditClient from "./views/UserManager/New&Edit/Client/confirmEditClient";

import NotAuth from "./notAuth";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Menu from "../src/components/menu";

class App extends React.Component {
  state = {
    auth: ""
  };

  componentDidMount() {
    this.updateUser();
  }

  updateUser = async () => {
    this.setState({
      auth: await ApiConfig.getUser()
    });
  };

  renderRoutes = () => {
    if (this.state.auth == "admin") {
      return (
        <Menu>
          <Route exact path="/api-docs" component={SwaggerTest}/>
          <Route exact path="/filemng" component={FileManager} />
          <Route exact path="/changepassword" component={ChangePassword} />
          <Route exact path="/plans" component={PlanManager} />
          <Route exact path="/usermng" component={UserManager} />
          <Route exact path="/newclient" component={NewClient} />
          <Route exact path="/newdepartments" component={NewDepartments} />
          <Route exact path="/confirmclient" component={ConfirmClient} />
          <Route exact path="/editclient" component={EditClient} />
          <Route exact path="/editdepartments" component={EditDepartments} />
          <Route exact path="/footer" component={Footer}/>
          <Route
            exact
            path="/confirmeditclient"
            component={ConfirmEditClient}
          />
          <Route exact path="/newuser" component={newUser} />

          <Route exact path="/edituser" component={editUser} />
        </Menu>
      );
    } else if (this.state.auth == "client") {
      return (
        <Menu>
          <Route exact path="/filemng" component={FileManager} />
          <Route exact path="/changepassword" component={ChangePassword} />
          <Route exact path="/newuser" component={newUser} />
        </Menu>
      );
    } else if (this.state.auth == "user") {
      return (
        <Menu>
          <Route exact path="/filemng" component={FileManager} />
          <Route exact path="/changepassword" component={ChangePassword} />
        </Menu>
      );
    } else {
      return (
        <div>
          <NotAuth />
        </div>
      );
    }
  };

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={props => <Login {...props} updateUser={this.updateUser} />}
          />

          {this.renderRoutes()}
        </Switch>
      </Router>
    );
  }
}

export default App;
