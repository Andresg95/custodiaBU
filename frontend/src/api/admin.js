import { publicServer } from "./api";
import config from "./config";

let auth = async () => ({
  headers: {
    Authorization: await config.getJWT()
  }
});

export default {
  getById: async id => {
    const response = await publicServer.get(`/admin/${id}`, await auth());
    return response.data;
  },
  update: async admin => {
    const response = await publicServer.put(
      `/admin/${admin.id}`,
      {
        ...admin
      },
      await auth()
    );
    return response.data;
  }
};
