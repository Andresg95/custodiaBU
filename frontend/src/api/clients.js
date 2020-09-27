import { publicServer } from "./api";
import config from "./config";

let auth = async () => ({
  headers: {
    Authorization: await config.getJWT()
  }
});

export default {
  getAll: async params => {
    const authorization = await auth();
    const response = await publicServer.get(`/clients`, {
      ...authorization,
      params
    });
    return response.data;
  },
  getById: async id => {
    const response = await publicServer.get(`/client/${id}`, await auth());
    return response.data;
  },
  getCustomizationData: async id => {
    const response = await publicServer.get(
      `/client/${id}/customizationdata`,
      await auth()
    );
    return response.data;
  },

  delete: async id => {
    const response = await publicServer.delete(`/client/${id}`, await auth());
    return response.data;
  },
  create: async client => {
    const response = await publicServer.post(
      `/clients`,
      {
        ...client
      },
      await auth()
    );
    return response.data;
  },
  update: async client => {
    const response = await publicServer.put(
      `/client/${client.id}`,
      {
        ...client
      },
      await auth()
    );
    return response.data;
  }
};
