
const fs = require('fs');

module.exports = {


    cleaner : async (json, file, folder) => {


        fs.unlinkSync(json, (err) => {
            if (err) {
                console.log(err)
            }
        });

        fs.unlinkSync(file, (err) => {
            if (err) {
                console.log(err);
            }
        })

        try {
            fs.rmdirSync(folder);
          } catch (error) {
            console.log("otro usuarios esta subiendo el mismo fichero");
          }

        return true;

    }


}