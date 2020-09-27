const models = require("../models");
const {
  api_user,
  api_password,
  baseURLapi
} = require("../../config/dbConfig");
const { createClient } = require("webdav");

const clear = async () => {
  
  const url = baseURLapi.concat("265_PandaExpress");
  const client = createClient(url, {
    username: api_user,
    password: api_password
  });
  let contents = await client.getDirectoryContents("/");
  let withoutAvatar = contents.filter( item =>  item.basename != "base64Avatar.txt");
  
  
  try {
  withoutAvatar.forEach(file => {
    client
    .deleteFile(`/${file.basename}`)
    .then(response => {
      console.log("borrando ", file.basename )
      return response;
    })
    .catch(er => {
     console.log(`error deleting, ${er}`);
      throw er;
    });
  });

    await models.bulk_upload_temp.destroy({
      where: {},
      truncate: true
    });

    console.log("erased temp bulk");
    await models.field_file_xref.destroy({
      where: {}
    });
    console.log("erased temp field file xref");

    await models.file.destroy({
      where: {}
    });

    console.log("erased files");
  } catch (error) {
    console.log(error);
  }

  return "db cleared";
};

console.log(clear());
