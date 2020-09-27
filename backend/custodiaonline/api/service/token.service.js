const jwt = require("jsonwebtoken");
const JWTConfig = require("../../config/JWTconfig");

const generateToken = (email, scope) => {
  const payload = { email, scope };

  const token =
    "Bearer " +
    jwt.sign(payload, JWTConfig.secret, {
      expiresIn: JWTConfig.expiresIn
    });

  return token;
};

module.exports = {
  generateToken
};
