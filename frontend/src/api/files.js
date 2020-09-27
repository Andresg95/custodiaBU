import { publicServer } from "./api";
import config from "./config";

let auth = async () => ({
  headers: {
    Authorization: await config.getJWT()
  }
});

let sendFileHeaders = async () => ({
  headers: {
    Authorization: await config.getJWT(),
    "content-type": "multipart/form-data"
  }
});

export default {
  getAll: async params => {
    const authorization = await auth();
    const response = await publicServer.get(`/files`, {
      ...authorization,
      params
    });
    return response.data;
  },
  getById: async id => {
    const response = await publicServer.get(`/file/${id}`, await auth());
    return response.data;
  },
  delete: async id => {
    const response = await publicServer.delete(
      `/file/client/${id}`,
      await auth()
    );
    return response.data;
  },
  create: async file => {
    const response = await publicServer.post(
      `/files`,
      file,

      await sendFileHeaders()
    );

    return response.data;
  },
  preview: async params => {
    const authorization = await auth();
    const response = await publicServer.get(`/file/preview`, {
      ...authorization,
      params
    });
    return response.data;
  },
  getDepartmentFiles: async params => {
    const authorization = await auth();
    const response = await publicServer.get(
      `/files/department/${params.id}`,
      { ...authorization, params },
      await auth()
    );

    return response.data;
  },

  download: async params => {
    const authorization = await auth();
    const response = await publicServer.get(
      `/file/download`,
      { ...authorization, params },
      await auth()
    );

    return response.data;
  }
};
