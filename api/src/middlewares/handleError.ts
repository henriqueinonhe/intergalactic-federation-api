import { ValidationError } from "../exceptions/ValidationError.js";
import { AuthenticationError } from "../exceptions/AuthenticationError.js";
import { ResourceNotFoundError } from "../exceptions/ResourceNotFoundError.js";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export async function handleError(error : ErrorRequestHandler, 
                                  req : Request, 
                                  res : Response, 
                                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                  next : NextFunction) : Promise<void> {

  if(error instanceof ValidationError) {
    res.status(422).send({ error });
  }
  else if(error instanceof AuthenticationError) {
    res.status(401).send({ error });
  }
  else if(error.name === "UnauthorizedError") {
    res.status(401).send({ error });
  }
  else if(error instanceof ResourceNotFoundError) {
    res.status(404).send({ error });
  }
  else {
    res.status(500).send({ error });
  }
}