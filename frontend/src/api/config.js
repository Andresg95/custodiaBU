let JWT = "";
let USER = "";
let ID = "";

export default {
  getJWT: async () => {
    return await JWT;
  },
  setJWT: async jwt => {
    JWT = await jwt;
  },
  getUser: async () => {
    return await USER;
  },
  setUser: async userType => {
    USER = userType;
  },
  getId: async () => {
    return await ID;
  },
  setId: async id => {
    ID = id;
  }
};
