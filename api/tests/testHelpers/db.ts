import { sample, sampleSize, random as randomNumber } from "lodash";
import { createConnection, getConnection } from "typeorm";
import { Contract } from "../../src/entities/Contract";
import { Pilot } from "../../src/entities/Pilot";
import { Planet } from "../../src/entities/Planet";
import { Refill } from "../../src/entities/Refill";
import { Resource } from "../../src/entities/Resource";
import { Ship } from "../../src/entities/Ship";
import { TravellingData } from "../../src/entities/TravellingData";
import { env } from "../../src/env";
import { randomContract, randomList, randomPilot, randomRefill, randomResource, randomShip, randomUndefinable } from "./random";

export async function connection() : Promise<void> {
  await createConnection({
    name: "Test Connection",
    type: "mysql",
    host: env.TYPEORM_HOST,
    database: env.TYPEORM_DATABASE,
    username: env.TYPEORM_USERNAME,
    password: env.TYPEORM_PASSWORD,
    port: parseInt(env.TYPEORM_PORT),
    entities: [Contract, Pilot, Planet, Refill, Resource, Ship, TravellingData]
  });
}

export async function close() : Promise<void> {
  await getConnection("Test Connection").close();
}

export async function clearDb() : Promise<void> {
  const connection = getConnection("Test Connection");

  const refillsRepository = connection.getRepository(Refill);
  const resourcesRepository = connection.getRepository(Resource);
  // const travellingDataRepository = connection.getRepository(TravellingData);
  const contractsRepository = connection.getRepository(Contract);
  const pilotsRepository = connection.getRepository(Pilot);
  const shipsRepository = connection.getRepository(Ship);
  // const planetsRepository = connection.getRepository(Planet);

  await refillsRepository.clear();
  await resourcesRepository.clear();
  await contractsRepository.clear();
  await pilotsRepository.clear();
  await shipsRepository.clear();
}

export async function populateDb() : Promise<void> {
  const connection = getConnection("Test Connection");

  const planetsRepository = connection.getRepository(Planet);
  const shipsRepository = connection.getRepository(Ship);
  const pilotsRepository = connection.getRepository(Pilot);
  const resourcesRepository = connection.getRepository(Resource);
  const contractsRepository = connection.getRepository(Contract);
  const refillsRepository = connection.getRepository(Refill);

  const planets = await planetsRepository.find({});
  const ships = randomList(randomShip, 40);

  const unownedShips = ships.slice();
  const pilots = randomList(() => {
    const locationPlanetId = sample(planets)!.id;
    const shipId = randomUndefinable(sample(unownedShips)!.id);

    if(shipId) {
      unownedShips.splice(unownedShips.findIndex(ship => ship.id === shipId), 1);
    }
    return randomPilot(locationPlanetId, shipId);
  }, 20);

  const resources = randomList(randomResource, 500);

  const unallocatedResources = resources.slice();
  const contracts = randomList(() => {
    const originPlanetId = sample(planets)!.id;
    const destinationPlanetId = sample(planets.filter(e => e.id !== originPlanetId))!.id;
    const resources = sampleSize(unallocatedResources, randomNumber(5));

    resources.forEach(resource => {
      unallocatedResources.splice(unallocatedResources.findIndex(e => e.id === resource.id), 1);
    });

    const payloadIds = resources.map(e => e.id);

    return randomContract(originPlanetId, destinationPlanetId, payloadIds);
  }, 80);

  const refills = randomList(() => {
    const pilotId = sample(pilots)!.id;
    return randomRefill(pilotId);
  }, 300);

  await shipsRepository.save(ships);
  await pilotsRepository.save(pilots);
  await resourcesRepository.save(resources);
  await contractsRepository.save(contracts);
  await refillsRepository.save(refills);
}

