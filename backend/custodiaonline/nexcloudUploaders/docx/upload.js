const axios = require("axios");
const fs = require("fs");
const logger = require("../../config/logger");
const { api_user, api_password, baseURLapi } = require("../../config/dbConfig");

const moment = require("moment");
const path = require("path");
const util = require("util");

const uploadlistener = async () => {
  //construct url from parent folder and file inside it

  const readdir = util.promisify(fs.readdir);
  let pathToSearch = path.join(__dirname, "../../", "api", "tempfile", "files");

  let folder = await readdir(pathToSearch);
  let finalbaseroot = folder[0];
  let files = await readdir(path.join(pathToSearch, finalbaseroot));

  let url = `${baseURLapi}${finalbaseroot}/${files[0]}`;
  console.log({ url });

  let finalFilePath = path.join(pathToSearch, finalbaseroot, files[0]);
  let bufferedData = fs.readFileSync(finalFilePath).buffer;

  const exists = await axios
    .get(url, {
      responseType: "arraybuffer",
      auth: {
        username: api_user,
        password: api_password
      },
      headers: {
        "Content-Type": "content/json",
        "OCS-APIRequest": true
      }
    })
    .then(response => {
      return true;
    })
    .catch(async e => {
      return false;
    });

  if (exists) {
    fs.writeFile(
      path.join(pathToSearch, finalbaseroot, `${files[0]}.json`),
      JSON.stringify({ repeatead: true }),
      err => {
        if (err) {
          console.log({ err });
        }
      }
    );
  } else {
    let upload = await axios
      .put(url, bufferedData, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        auth: {
          username: api_user,
          password: api_password
        },
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "OCS-APIRequest": true
        }
      })
      .then(async res => {
        logger.log({
          level: "info",
          message: `pdf uploaded--->  ${res.status}`
        });
        let obj = {
          status: await res.status,
          headers: {
            etag: await res.headers.etag
          },
          config: {
            url: await res.config.url
          }
        };

        return JSON.stringify(obj);
      })
      .catch(e => {
        console.log(e);

        logger.log({
          level: "error",
          message: `Hubo un problema al intentar guardar el archivo a NC ${e.toString()}`,
          user_role: "admin",
          user_id: null,
          timestamp: moment(),
          request: "pdfToServer()",
          request_status: e.status,
          request_data: {}
        });

        throw e;
      });

    fs.writeFile(
      path.join(pathToSearch, finalbaseroot, `${files[0]}.json`),
      upload,
      err => {
        if (err) {
          console.log({ err });
        }
        return "done";
      }
    );
    return "done";
  }
};

uploadlistener();

module.exports = {
  uploadlistener
};
