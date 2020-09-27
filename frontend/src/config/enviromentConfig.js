const APP = "production";

let SSE_URL;
if (APP === "local") {
  SSE_URL = "http://localhost:10010/";
} else if (APP === "development") {
  SSE_URL = "http://ec2-35-181-50-167.eu-west-3.compute.amazonaws.com:10010/";
} else if (APP === "production") {
  SSE_URL = "http://ec2-52-47-125-122.eu-west-3.compute.amazonaws.com:10010/";
}

module.exports = {
  APP,
  SSE_URL
};
