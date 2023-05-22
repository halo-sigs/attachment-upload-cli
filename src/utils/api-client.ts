import axios from "axios";
import Configstore from "configstore";

const config = new Configstore("@halo-dev/attachment-upload-cli", {}, { globalConfigPath: true });

const apiClient = axios.create({
  baseURL: config.get("siteUrl"),
  auth: {
    username: config.get("username"),
    password: config.get("password"),
  },
});

export default apiClient;
