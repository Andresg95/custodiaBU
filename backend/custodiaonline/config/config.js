const CONFIG = require ('./dbConfig');

module.exports = {
  "development": {
    "username": CONFIG.db_user,
    "password": CONFIG.db_password,
    "database": CONFIG.db_name,
    "host": CONFIG.db_host,
    "dialect": CONFIG.db_dialect
  },
  "test": {
    "username": CONFIG.db_user,
    "password": CONFIG.db_password,
    "database": CONFIG.db_name,
    "host": CONFIG.db_host,
    "dialect": CONFIG.db_dialect
  },
  "production": {
    "username": CONFIG.db_user,
    "password": CONFIG.db_password,
    "database": CONFIG.db_name,
    "host": CONFIG.db_host,
    "dialect": CONFIG.db_dialect,
    
  }
}
