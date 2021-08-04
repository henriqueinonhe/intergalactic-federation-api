import { getRepository } from "typeorm";
import { Contract } from "../../src/entities/Contract";
import { Pilot } from "../../src/entities/Pilot";
import { Planet } from "../../src/entities/Planet";
import { Refill } from "../../src/entities/Refill";
import { Resource } from "../../src/entities/Resource";
import { Ship } from "../../src/entities/Ship";
import { TravellingData } from "../../src/entities/TravellingData";

export async function clearDb() : Promise<void> {
  const refillsRepository = getRepository(Refill);
  const resourcesRepository = getRepository(Resource);
  // const travellingDataRepository = getRepository(TravellingData);
  const contractsRepository = getRepository(Contract);
  const pilotsRepository = getRepository(Pilot);
  const shipsRepository = getRepository(Ship);
  // const planetsRepository = getRepository(Planet);

  await refillsRepository.clear();
  await resourcesRepository.clear();
  await contractsRepository.clear();
  await pilotsRepository.clear();
  await shipsRepository.clear();
}
