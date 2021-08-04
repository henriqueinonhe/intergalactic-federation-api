import { getRepository } from "typeorm";
import { Planet } from "../entities/Planet";

export class PlanetsService {
  public static async getPlanets() : Promise<Array<Planet>> {
    const planetsRepository = getRepository(Planet);

    return await planetsRepository.find({});
  }
}