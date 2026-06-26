import axios from "axios";

/**
 * Creates a small axios instance with sane defaults for calling the
 * third-party environmental data APIs (EnggEnv, WBPCB, Paribesh, Distronix).
 *
 * Every legacy `file_get_contents()` / `curl_exec()` call in the PHP project
 * is replaced by a call through one of these clients.
 */
export function createHttpClient(baseConfig = {}) {
  return axios.create({
    timeout: 15000,
    ...baseConfig,
  });
}

export const httpClient = createHttpClient();
