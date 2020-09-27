const controllerHelper = require("../helpers/controller.helper");
const swaggerService = require("../service/swaggerService");
const MODULE_NAME = "[Swagger Controller]";

const getSwagger = async (req, res) => {

  try {
    const swagger_json = await swaggerService.getSwaggerFileContents();
    res.status(200).json(swagger_json);
  } catch (error) {
    controllerHelper.handleErrorResponse(
      MODULE_NAME,
      getSwagger.name,
      error,
      res
    );
  }
};


module.exports = {
  getSwagger
};