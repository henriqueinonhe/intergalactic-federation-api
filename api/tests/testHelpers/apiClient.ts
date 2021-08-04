import axios from "axios";
import https from "https";
import { env } from "../../src/env";

export const apiClient = axios.create({
  baseURL: `https://localhost:${env.PORT}`,
  validateStatus: () => true, //We don't want it to throw exceptions
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});