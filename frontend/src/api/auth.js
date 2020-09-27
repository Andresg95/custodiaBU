import { publicServer } from "./api";
import config from "./config";

export default {
  authenticate: async params => {
    const response = await publicServer.post(`/authenticate`, params);
    config.setJWT(response.data.token);
    config.setUser(response.data.type);
    config.setId(response.data.id);

    return response.data ? response.data : response;
  },
  recoverPassword: async email => {
    const response = await publicServer.post(`/recoverpassword`, email);
    return response.data;
  },
  checkEmailRepetition: async email => {
    const response = await publicServer.post(
      `/emailrepetition`,

      email,
      {
        headers: {
          Authorization: await config.getJWT()
        }
      }
    );
    return response.data;
  }
};
