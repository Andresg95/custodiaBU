var fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const readFile = () => {
  return fs.readFileSync(path.join(__dirname, "../swagger/swagger.yaml"), "utf-8");
};

const getSwaggerFileContents = async () => {
  let rawYAML = await readFile();
  return yaml.load(rawYAML);
};

module.exports = {
  getSwaggerFileContents
};
