const handleSuccessResponse = (success, data) => {
  return new Promise((resolve, reject) => {
    if (success == true) {
      let parsedResponse = {
          data
      };

      resolve(parsedResponse);
    } else {
      reject(data);
    }
  });
};


const handleErrorReponse = (success, data, code, error, message) => {
  return new Promise((resolve, reject) => {
    if (success == false) {
      let parsedResponse = {
        
            code,
            error,
            message,
            data
        
      };      
      resolve(parsedResponse);
    } else {
      reject(data);
    }
  });
};

module.exports = {
  handleSuccessResponse,
  handleErrorReponse
};
