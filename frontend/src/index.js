import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { ColorProvider } from "./context/colorContext";
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#6AD59F"
    },
    secondary: { main: "#448866" }
  },
  typography: {
    fontFamily: "'Lato', sans-serif",
    fontWeightMedium: 400,
    h2: {
      fontWeight: 500,
      fontStyle: "italic",
      fontSize: "35px",
      color: "#353535",
      textAlign: "left"
    },
    caption: {
      fontWeight: 400,
      fontSize: 20
    },
    button: {
      fontWeight: 700
    },
    useNextVariants: true
  }
});

ReactDOM.render(
  <div>
    <ColorProvider>
      <MuiThemeProvider theme={theme}>
        <App />
      </MuiThemeProvider>
    </ColorProvider>
  </div>,
  document.getElementById("root")
);
