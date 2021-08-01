import express from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { handleError } from "./middlewares/handleError";
import { router } from "./routes";
import { env } from "./env";
import cors from "cors";
import https from "https";
import fs from "fs";

(async () => {
  try {
    await createConnection();
  }
  catch(error) {
    console.log(error);
  }
  
  const app = express();
  app.use(express.json());
  app.use(express.static("public"));
  app.use(cors());
  
  app.get("/health", (req, res) => {
    res.send("Ok");
  });

  app.use(router);
  app.use(handleError);

  
  if(env.USE_HTTPS === "true") {
    const server = https.createServer({
      key: fs.readFileSync("./certs/server.key"),
      cert: fs.readFileSync("./certs/server.cert")
    }, app);
    
    server.listen(env.PORT, () => {
      console.log(`API up at ${process.env.PORT}!`);
    });
  }
  else {
    app.listen(env.PORT, () => {
      console.log(`API up at ${process.env.PORT}!`);
    });
  }
  
})();
