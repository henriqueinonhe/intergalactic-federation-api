import { wrapAsyncController } from "../helpers/wrapController";
import { ReportsService } from "../services/ReportsService";

export class ReportsController {
  public static getPlanetsResourcesSummary = wrapAsyncController(async (req, res, next) => {
    const report = await ReportsService.getPlanetsResourcesSummary();
    
    res.send(report);
    next();
  });

  public static getPilotsResourcesSummary = wrapAsyncController(async (req, res, next) => {
    const report = await ReportsService.getPilotsResourcesSummary();
    
    res.send(report);
    next();
  })

  public static getTransactionsLedger = wrapAsyncController(async (req, res, next) => {
    const report = await ReportsService.getTransactionsLedger();
    
    res.send(report);
    next();
  })
}