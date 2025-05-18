import axios from "axios";
import Configstore from "configstore";

const configStore = new Configstore("@halo-dev/attachment-upload-cli", {}, { globalConfigPath: true });

const apiClient = axios.create({
  baseURL: configStore.get("siteUrl"),
});

apiClient.interceptors.request.use((config) => {
  const pat = configStore.get("pat");
  if (pat) {
    config.headers.Authorization = `Bearer ${pat}`;
    return config;
  }
  // @deprecated, remove in the future
  const username = configStore.get("username");
  const password = configStore.get("password");
  if (username && password) {
    config.auth = { username, password };
    return config;
  }
  throw new Error("No authentication method found, please run `hau setup` to setup your authentication method");
});

export default apiClient;
