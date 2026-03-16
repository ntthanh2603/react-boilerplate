import Axios, { AxiosError, type AxiosRequestConfig } from "axios";
import Qs from "qs";

export const axiosInstance = Axios.create({
  baseURL: process.env.VITE_API_URL || "http://localhost:3000",
  paramsSerializer: (params) => Qs.stringify(params, { arrayFormat: "repeat" }),
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/**
 * Axios client implementation for Orval-generated API clients.
 * Uses modern AbortController instead of deprecated CancelToken.
 */
export const orvalClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> & { cancel: () => void } => {
  const controller = new AbortController();
  const promise = axiosInstance<T>({
    ...config,
    ...options,
    signal: controller.signal,
  });

  const promiseWithCancel = promise as Promise<T> & { cancel: () => void };
  promiseWithCancel.cancel = () => {
    controller.abort();
  };

  return promiseWithCancel;
};

export type HttpError<T = unknown> = AxiosError<T>;
export type RequestBody<T = unknown> = T;
