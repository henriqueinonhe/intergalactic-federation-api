import { wrapAsyncController } from "../helpers/wrapController";

export class ReportsController {
  public static planetsResourcesSummary = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });

  public static pilotsResourcesSummary = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  })

  public static transactionsLedger = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  })
}