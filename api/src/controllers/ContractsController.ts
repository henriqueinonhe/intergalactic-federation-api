import { wrapAsyncController } from "../helpers/wrapController";

export class ContractsController {
  public static createContract = wrapAsyncController(async (req, res, next) => {
    //TODO
    next();
  });

  public static getContracts = wrapAsyncController(async (req, res, next) => {
    //TODO
    next();
  });
}