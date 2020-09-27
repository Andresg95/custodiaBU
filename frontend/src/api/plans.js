import { publicServer } from "./api";
import config from "./config";

let auth = async () => ({
  headers: {
    Authorization: await config.getJWT()
  }
});

export default {
  getAll: async params => {
    const response = await publicServer.get(`/plans`, await auth(), { params });
    return response.data;
  },
  getById: async id => {
    const response = await publicServer.get(`/plan/${id}`, await auth());
    return response.data;
  },
  delete: async id => {
    const response = await publicServer.delete(`/plan/${id}`, await auth());
    return response.data;
  },
  create: async plan => {
    const response = await publicServer.post(
      `/plans`,
      {
        ...plan
      },
      await auth()
    );
    return response.data;
  },
  update: async plan => {
    const response = await publicServer.put(
      `/plan/${plan.id}`,
      {
        ...plan
      },
      await auth()
    );
    return response.data;
  }
};
