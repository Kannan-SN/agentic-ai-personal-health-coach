import config from "../../config";
import paramsEncoder from "../../lib/paramsEncoder";
import Axios from "axios";
import refreshContext from "../refreshContext";
import { refreshToken } from "../user/client";

const axiosInstance = Axios.create({
  baseURL: config.AGENT_URL,
  withCredentials: true,
  paramsSerializer: paramsEncoder,
  headers: {
    "Content-Type": "application/json",
    Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    "Device-Type": "web",
  },
});

axiosInstance.interceptors.request.use(
  (requestConfig) => {
    const local = localStorage.getItem("accessToken");

    const accessToken = local;
    if (accessToken && !requestConfig.url.endsWith("refresh-token")) {
      requestConfig.headers.Authorization = accessToken.includes("Bearer")
        ? accessToken
        : `Bearer ${accessToken}`;
    } else {
      requestConfig.headers.Authorization = "";
    }

    requestConfig.headers.TIMESTAMP = new Date().toISOString();
    requestConfig.headers.TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return requestConfig;
  },
  (error) => {
    throw error;
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status === 401 &&
      error.config.url.endsWith("refresh-token")
    ) {
      return Promise.reject(error);
    } else if (error?.response?.status === 401 && !originalRequest._retry) {
      if (refreshContext.isRefreshing) {
        try {
          const token = await new Promise((resolve) => {
            refreshContext.resolverList.push((newToken) => {
              resolve(newToken);
            });
          });

          originalRequest.headers["Authorization"] = token;
        } catch (error) {
          throw error;
        }
      }

      originalRequest._retry = true;
      if (!refreshContext.isRefreshing) {
        refreshContext.isRefreshing = true;

        const { success, tokens } = await refreshToken();
        if (!success) {
            if (!window.location.pathname.startsWith('/profile/')) {
                window.location.replace('/signout')
            }
            throw error
        }

        localStorage.setItem("accessToken", tokens.accessToken);

        if (success) {
          refreshContext.isRefreshing = false;
          refreshContext.resolverList.forEach((cb) =>
            cb(tokens.accessToken)
          );
          refreshContext.resolverList = [];
        }

        originalRequest.headers["Authorization"] = tokens.accessToken;
      }

      return axiosInstance(originalRequest);
    } else {
      throw error;
    }
  }
);

export default axiosInstance;