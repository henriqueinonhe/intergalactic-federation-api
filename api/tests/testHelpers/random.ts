import { Ship } from "../../src/entities/Ship";
import { ShipCreationData } from "../../src/services/ShipsService";
import { random as randomNumber } from "lodash";
import RandExp from "randexp";
import { Pilot } from "../../src/entities/Pilot";
import { PilotCreationData } from "../../src/services/PilotsService";
import { generateLuhnCheckDigit } from "../../src/helpers/luhn";
import { precisionNumberRegex } from "../../src/helpers/precisionNumbers";
import { Refill } from "../../src/entities/Refill";
import { Contract } from "../../src/entities/Contract";
import { ContractCreationData } from "../../src/services/ContractsService";
import { Resource } from "../../src/entities/Resource";
import { getConnection } from "typeorm";

export function randomMonthString() : string {
  return new RandExp(/(0[1-9])|10|11|12/).gen();
}

export function randomDayString() : string {
  return new RandExp(/(0[1-9])|((1|2)[0-9])/).gen();
}

export function randomDate() : string {
  return `${randomNumber(2000, 2020)}-${randomMonthString()}-${randomDayString()}`;
}

export function randomList<T>(generator : () => T, length : number) : Array<T> {
  return new Array(length).fill(null).map(() => generator());
}

export function randomShipCreationData() : ShipCreationData {
  const weightCapacity = randomNumber(1, 10000);
  const fuelCapacity = randomNumber(1, 10000);
  const currentWeight = randomNumber(1, weightCapacity);
  const fuelLevel = randomNumber(1, fuelCapacity);

  return {
    weightCapacity,
    fuelCapacity,
    currentWeight,
    fuelLevel
  };
}

export function randomShip() : Ship {
  const connection = getConnection("Test Connection");
  const shipsRepository = connection.getRepository(Ship);
  return shipsRepository.create({
    ...randomShipCreationData()
  });
}

export function randomPilotCertification() : string {
  const partialCode = new RandExp(/\d{6}/).gen();
  const code = partialCode + generateLuhnCheckDigit(partialCode);
  return code;
}

export function randomName() : string {
  return new RandExp(/[A-Z][a-z]{2,12}/).gen();
}

export function randomSuitableAge() : number {
  return randomNumber(18, 100);
}

export function randomPrecisionNumber() : string {
  return new RandExp(precisionNumberRegex).gen();
}

export function randomPilotCreationData(currentLocationId : string, shipId ?: string) : PilotCreationData {
  return {
    certification: randomPilotCertification(),
    name: randomName(),
    age: randomSuitableAge(),
    credits: randomPrecisionNumber(),
    currentLocationId,
    shipId
  };
}

export function randomPilot(currentLocationId : string, shipId ?: string) : Pilot {
  const connection = getConnection("Test Connection");
  const pilotsRepository = connection.getRepository(Pilot);
  return pilotsRepository.create({
    ...randomPilotCreationData(currentLocationId, shipId)
  });
}

export function randomRefill(pilotId : string, maxAmount = 200) : Refill {
  const connection = getConnection("Test Connection");
  const refillsRepository = connection.getRepository(Refill);
  return refillsRepository.create({
    amount: randomNumber(1, maxAmount),
    pilotId
  });
}

export function randomDescription() : string {
  return new RandExp(/\w{5,22}/).gen();
}

export function randomContractCreationData(originPlanetId : string, 
                                           destinationPlanetId : string,
                                           payloadIds : Array<string>) : ContractCreationData {
  return {
    description: randomDescription(),
    originPlanetId,
    destinationPlanetId,
    value: randomPrecisionNumber(),
    payloadIds
  };
}

export function randomContract(originPlanetId : string, 
                               destinationPlanetId : string,
                               payloadIds : Array<string>) : Contract {
                                 
  const connection = getConnection("Test Connection");
  const contractsRepository = connection.getRepository(Contract);
  return contractsRepository.create({
    ...randomContractCreationData(originPlanetId, destinationPlanetId, payloadIds)
  });
}

export function randomResource(contractId ?: string) : Resource {
  const connection = getConnection("Test Connection");
  const resourcesRepository = connection.getRepository(Resource);
  return resourcesRepository.create({
    name: randomName(),
    weight: randomNumber(1, 200),
    contractId
  });
}

export function randomUndefinable<T>(value : T, undefinedProbability = 0.33) : T | undefined {
  if(Math.random() > undefinedProbability) {
    return value;
  }
}