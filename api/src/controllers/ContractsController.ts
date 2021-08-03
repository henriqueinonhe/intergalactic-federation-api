import { wrapAsyncController } from "../helpers/wrapController";

export class ContractsController {
  public static createContract = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });

  public static getContracts = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });
}