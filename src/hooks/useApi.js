import { useState, useCallback } from "react";
import api from "../services/api";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (method.toLowerCase()) {
        case "get":
          response = await api.get(url, config);
          break;
        case "post":
          response = await api.post(url, data, config);
          break;
        case "put":
          response = await api.put(url, data, config);
          break;
        case "patch":
          response = await api.patch(url, data, config);
          break;
        case "delete":
          response = await api.delete(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return { data: response.data, success: true };
    } catch (err) {
      const errorObj = {
        message: err.message || "Request failed",
        status: err.status,
        data: err.data,
      };

      setError(errorObj);
      return { error: errorObj, success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    callApi,
    resetError,
    // Convenience methods
    get: (url, config) => callApi("get", url, null, config),
    post: (url, data, config) => callApi("post", url, data, config),
    put: (url, data, config) => callApi("put", url, data, config),
    patch: (url, data, config) => callApi("patch", url, data, config),
    delete: (url, config) => callApi("delete", url, null, config),
  };
};

export default useApi;
