import { Pilot } from "../entities/Pilot";
import { Planet } from "../entities/Planet";

export type PlanetsResourcesSummary = Array<{
  planet : Planet;
  sent : Record<string, number>;
  received : Record<string, number>;
}>;

export type PilotsResourcesSummary = Array<{
  pilot : Pilot;
} & Record<string, number>>;

export type TransactionsLedger = Array<{
  description : string;
  value : string;
}>;

export class ReportsService {
  public static async getPlanetsResourcesSummary() : Promise<PlanetsResourcesSummary> {
    return {} as any;
  }

  public static async getPilotsResourcesSummary() : Promise<PilotsResourcesSummary> {
    return {} as any;
  }

  public static async getTransactionsLedger() : Promise<TransactionsLedger> {
    return {} as any;
  }
}