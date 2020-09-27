import { publicServer } from "./api";
import config from "./config";

let auth = async () => ({
  headers: {
    Authorization: await config.getJWT()
  }
});

export default {
  getById: async id => {
    const response = await publicServer.get(`/user/${id}`, await auth());
    return response.data;
  },
  delete: async id => {
    const response = await publicServer.delete(`/user/${id}`, await auth());
    return response.data;
  },
  accept: async id => {
    const response = await publicServer.put(
      `/user/accept/${id}`,

      {
        accept: true
      },
      await auth()
    );
    return response.data;
  },
  create: async user => {
    const response = await publicServer.post(
      `/users`,
      {
        ...user
      },
      await auth()
    );
    return response.data;
  },
  update: async user => {
    const response = await publicServer.put(
      `/user/${user.id}`,
      {
        ...user
      },
      await auth()
    );
    return response.data;
  }
};
