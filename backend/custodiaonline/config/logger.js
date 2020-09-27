const {createLogger, format, transports} = require("winston");
require("winston-daily-rotate-file");
const fs = require('fs');
const path = require('path');
const moment = require("moment"); //Para las fechas

const env = process.env.APP || "development"; //Entorno.

const logDir = path.join(__dirname, '../', '../', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

getTransports = () => {
  return (env == "production") ? 
     new transports.DailyRotateFile({
    filename: `${logDir}/logs%DATE%.json`,
    datePattern: 'YYYY-MM-DD'
  }) : 
  new transports.Console();
}


const logger = createLogger({
  format: format.json(),
  transports: [ 
   getTransports()
  ]
});

module.exports = logger;
