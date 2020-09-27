import { publicServer } from "./api";
import config from "./config";

let auth = async () => ({
  headers: {
    Authorization: await config.getJWT()
  }
});

export default {
  getByDepartmentId: async id => {
    const response = await publicServer.get(`/fields/${id}`, await auth());
    return response.data;
  }
};
