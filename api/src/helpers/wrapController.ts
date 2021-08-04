import { Request, Response, NextFunction } from "express";

type ExpressAsyncController = (req : Request, res : Response, next : NextFunction) => Promise<void>;

export function wrapAsyncController(controller : ExpressAsyncController) : ExpressAsyncController {
  return async (...params : Parameters<ExpressAsyncController>) => {
    try {
      await controller(...params);
    }
    catch(error) {
      const next = params[2];
      next(error);
    }
  };
}