import ENV_VARIABLES from "../config/enviromentConfig";

const axios = require("axios");

export let url = "";

if (ENV_VARIABLES.APP === "local") {
  url = "http://localhost:10010/";
} else if (ENV_VARIABLES.APP === "development") {
  url = "http://ec2-35-181-50-167.eu-west-3.compute.amazonaws.com:10010/";
} else if (ENV_VARIABLES.APP === "production") {
  url = "http://ec2-52-47-125-122.eu-west-3.compute.amazonaws.com:10010/";
}

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  maxContentLength: Infinity,
  maxBodyLength: Infinity
};

const default_config = {
  baseURL: url,

  ...headers
};

export const publicServer = axios.create({
  ...default_config
});
