let CONFIG = {};

CONFIG.app = process.env.APP || "development";
CONFIG.port = process.env.PORT || "10010";

if (CONFIG.app == "production") {
  CONFIG.db_dialect = process.env.DB_DIALECT || "mysql";
  CONFIG.db_host =
    process.env.DB_HOST ||
    "custodiaonline.cgdswevug18d.eu-west-3.rds.amazonaws.com";
  CONFIG.db_port = process.env.DB_PORT || "3306";
  CONFIG.db_name = process.env.DB_NAME || "custodiaonline";
  CONFIG.db_user = process.env.DB_USER || "custodiaonline";
  CONFIG.db_password = process.env.DB_PASSWORD || "CustodiaOnline2019!";
  CONFIG.api_user = "nextcloud";
  CONFIG.api_password = "custodiaonline2019!";
  CONFIG.baseURLapi =
    process.env.API_URL ||
    "http://ec2-35-181-120-7.eu-west-3.compute.amazonaws.com:8080/remote.php/dav/files/nextcloud/";
  CONFIG.baseURLGroups =
    process.env.API_GROUPS ||
    "http://ec2-35-181-120-7.eu-west-3.compute.amazonaws.com:8080/ocs/v1.php/cloud/groups";
  CONFIG.baseURLFileSharing =
    process.env.API_FILESHARE ||
    "http://ec2-35-181-120-7.eu-west-3.compute.amazonaws.com:8080/ocs/v2.php/apps/files_sharing/api/v1/shares?";
}
if (CONFIG.app == "development") {
  CONFIG.db_dialect = process.env.DB_DIALECT || "mysql";
  CONFIG.db_host =
    process.env.DB_HOST || "custodiadev.c1esr2rq5cyn.eu-west-3.rds.amazonaws.com";
  CONFIG.db_port = process.env.DB_PORT || "3306";
  CONFIG.db_name = process.env.DB_NAME || "custodiaonline";
  CONFIG.db_user = process.env.DB_USER || "nextcloudmaster";
  CONFIG.db_password = process.env.DB_PASSWORD || "NextCloud2019!";
  CONFIG.api_user = "nextcloud";
  CONFIG.api_password = "custodiaonline2019!";
  CONFIG.baseURLapi =
    process.env.API_URL ||
    "http://ec2-35-181-50-167.eu-west-3.compute.amazonaws.com:8080/remote.php/dav/files/nextcloud/";
  CONFIG.baseURLGroups =
    process.env.API_GROUPS ||
    "http://ec2-35-181-50-167.eu-west-3.compute.amazonaws.com:8080/ocs/v1.php/cloud/groups";
  CONFIG.baseURLFileSharing =
    process.env.API_FILESHARE ||
    "http://ec2-35-181-50-167.eu-west-3.compute.amazonaws.com:8080/ocs/v2.php/apps/files_sharing/api/v1/shares?";
}
if (CONFIG.app == "local") {
  CONFIG.db_dialect = process.env.DB_DIALECT || "mysql";
  CONFIG.db_host = process.env.DB_HOST || "127.0.0.1";
  CONFIG.db_port = process.env.DB_PORT || "3306";
  CONFIG.db_name = process.env.DB_NAME || "custodiaonline";
  CONFIG.db_user = process.env.DB_USER || "phpmyadmin";
  CONFIG.db_password = process.env.DB_PASSWORD || "1234";
  CONFIG.api_user = "nextcloud";
  CONFIG.api_password = "custodiaonline2019!";
  CONFIG.baseURLapi =
  process.env.API_URL ||
  "http://localhost:8080/remote.php/dav/files/nextcloud/";
  CONFIG.baseURLGroups =
  process.env.API_GROUPS || "http://localhost:8080/ocs/v1.php/cloud/groups";
  CONFIG.baseURLFileSharing =
  process.env.API_FILESHARE ||
  "http://localhost:8080/ocs/v2.php/apps/files_sharing/api/v1/shares?";
}

module.exports = CONFIG;
