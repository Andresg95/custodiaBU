import React, { Component } from "react";
import Button from "@material-ui/core/Button";
//Routing
import { Link } from "react-router-dom";

var style = {
  backgroundColor: "#F8F8F8",
  marginTop: "10px",
  border: "1px solid #E7E7E7",
  textAlign: "center",
  padding: "20px",
  left: "0",
  bottom: "0",
  height: "80px",
  width: "100%"
};

// Footer for api docs
class Footer extends Component {
  render() {
    return (
      <div>
        <div style={style}>
          <Link to="/api-docs">
            <Button
              variant="outlined"
              style={{
                float: "center",
                color: "gray",
                borderColor: "black"
              }}
            >
              Ver documentación api
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
export default Footer;
