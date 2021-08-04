import axios from "axios";
import https from "https";

export const apiClient = axios.create({
  baseURL: `https://localhost:${process.env.PORT}`,
  validateStatus: () => true, //We don't want it to throw exceptions
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});