import { publicServer } from "./api";
import config from "./config";

let auth = async () => ({
  headers: {
    Authorization: await config.getJWT()
  }
});

export default {
  getById: async id => {
    const response = await publicServer.get(
      `/department/${id}`,
      await auth()
    );
    return response.data;
  }
};
