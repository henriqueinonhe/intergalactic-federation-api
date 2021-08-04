import { getConnection } from "typeorm";
import { Pilot } from "../entities/Pilot";
import { Planet } from "../entities/Planet";
import { PilotsService } from "./PilotsService";

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
    const connection = getConnection();
    const results = await connection.query(`
      SELECT originPlanet.name as sender, destinationPlanet.name as receiver, Resources.name, SUM(Resources.weight) 
      FROM Contracts
        JOIN Resources ON Contracts.id = Resources.contractId 
        JOIN Planets originPlanet ON Contracts.originPlanetId = originPlanet.id 
        JOIN Planets destinationPlanet ON Contracts.destinationPlanetId  = destinationPlanet.id 
      WHERE Contracts.fulfilledAt IS NOT NULL
      GROUP BY originPlanet.name, destinationPlanet.name, Resources.name, Resources.weight 
    `);

    return results as any;
  }

  public static async getPilotsResourcesSummary() : Promise<PilotsResourcesSummary> {
    const connection = getConnection();
    const results = await connection.query(`
      SELECT Pilots.name, Resources.name, SUM(Resources.weight)
      FROM Contracts
        JOIN Resources ON Contracts.id = Resources.contractId
        JOIN Pilots ON Contracts.contracteeId = Pilots.id
      WHERE Contracts.fulfilledAt IS NULL
      GROUP BY Pilots.name, Resources.name
    `);

    return results as any;
  }

  public static async getTransactionsLedger() : Promise<TransactionsLedger> {
    const connection = getConnection();
    const results = await connection.query(`
      SELECT CONCAT("Contract ", Contracts.id, ", ", description) as description, value, createdAt 
      FROM Contracts
      UNION ALL
      SELECT CONCAT(Pilots.name, " bought fuel"), amount * ?, Refills.createdAt 
      FROM Refills
        JOIN Pilots ON Pilots.id = Refills.pilotId 
      ORDER BY createdAt ASC
    `, [
      PilotsService.refuelCostPerUnit
    ]);

    return results as any;
  }
}