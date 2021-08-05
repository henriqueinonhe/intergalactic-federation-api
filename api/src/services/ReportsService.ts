import { getConnection } from "typeorm";
import { PilotsService } from "./PilotsService";

export type PlanetsResourcesSummary = Array<{
  planet : string;
  sent : Record<string, string>;
  received : Record<string, string>;
}>;

export type PilotsResourcesSummary = Array<{
  pilot : string;
  resources : Array<{
    name : string;
    weight : string
  }>;
}>;

export type TransactionsLedger = Array<{
  description : string;
  value : string;
  createdAt : string;
}>;

export class ReportsService {
  // Yeah... this is a mess, but time is short
  // and we gotta make it work regardless

  public static async getPlanetsResourcesSummary() : Promise<PlanetsResourcesSummary> {
    const connection = getConnection();
    const results = await connection.query(`
      SELECT originPlanet.name as sender, destinationPlanet.name as receiver, Resources.name, SUM(Resources.weight) AS weight
      FROM Contracts
        JOIN Resources ON Contracts.id = Resources.contractId 
        JOIN Planets originPlanet ON Contracts.originPlanetId = originPlanet.id 
        JOIN Planets destinationPlanet ON Contracts.destinationPlanetId  = destinationPlanet.id 
      WHERE Contracts.fulfilledAt IS NOT NULL
      GROUP BY originPlanet.name, destinationPlanet.name, Resources.name, Resources.weight 
    `);

    const table : Record<string, {
      sent : Record<string, string>,
      received : Record<string, string>
    }> = {};

    for(const entry of results) {
      console.log(entry);
      if(table[entry.sender] === undefined) {
        table[entry.sender] = {
          sent: {},
          received: {}
        };
      }
      
      if(table[entry.receiver]  === undefined) {
        table[entry.receiver] = {
          sent: {},
          received: {}
        };
      }
      
      table[entry.sender].sent[entry.name] = entry.weight;
      table[entry.receiver].received[entry.name] = entry.weight;
    }

    const formattedResult : PlanetsResourcesSummary = [];
    for(const planet in table) {
      formattedResult.push({
        planet,
        sent: table[planet].sent,
        received: table[planet].received
      });
    }

    return formattedResult;
  }

  public static async getPilotsResourcesSummary() : Promise<PilotsResourcesSummary> {
    const connection = getConnection();
    const results = await connection.query(`
      SELECT Pilots.name AS pilot, Resources.name, SUM(Resources.weight) AS weight
      FROM Contracts
        JOIN Resources ON Contracts.id = Resources.contractId
        JOIN Pilots ON Contracts.contracteeId = Pilots.id
      WHERE Contracts.fulfilledAt IS NOT NULL
      GROUP BY Pilots.name, Resources.name
    `);

    const table : Record<string, Array<{
      name : string,
      weight : string
    }>> = {};

    for(const entry of results) {
      if(!table[entry.pilot]) {
        table[entry.pilot] = [];
      }

      table[entry.pilot].push({
        name: entry.name,
        weight: entry.weight
      });
    }

    const formattedResults : PilotsResourcesSummary = [];
    for(const pilot in table) {
      formattedResults.push({
        pilot,
        resources: table[pilot]
      });
    }

    return formattedResults;
  }

  public static async getTransactionsLedger() : Promise<TransactionsLedger> {
    const connection = getConnection();
    const results = await connection.query(`
      SELECT CONCAT("Contract ", Contracts.id, ", ", description) AS description, -1 * value AS value, createdAt 
      FROM Contracts
      WHERE Contracts.fulfilledAt IS NOT NULL
      UNION ALL
      SELECT CONCAT(Pilots.name, " bought fuel"), amount * ?, Refills.createdAt 
      FROM Refills
        JOIN Pilots ON Pilots.id = Refills.pilotId 
      ORDER BY createdAt ASC
    `, [
      PilotsService.refuelCostPerUnit.toString()
    ]);

    return results;
  }
}