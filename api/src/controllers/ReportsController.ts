import { wrapAsyncController } from "../helpers/wrapController";

export class ReportsController {
  public static getPlanetsResourcesSummary = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });

  public static getPilotsResourcesSummary = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  })

  public static getTransactionsLedger = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  })
}