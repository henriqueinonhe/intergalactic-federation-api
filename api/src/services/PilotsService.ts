import Joi from "joi";
import { upperFirst } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { Contract } from "../entities/Contract";
import { Pilot } from "../entities/Pilot";
import { Planet } from "../entities/Planet";
import { Ship } from "../entities/Ship";
import { TravellingData } from "../entities/TravellingData";
import { ValidationErrorEntry, ValidationError } from "../exceptions/ValidationError";
import { isLuhnValid } from "../helpers/luhn";
import { precisionNumberRegex } from "../helpers/precisionNumbers";
import Big from "big.js";
import { Refill } from "../entities/Refill";

export interface PilotCreationData {
  certification : string;
  name : string;
  age : number;
  credits : string;
  currentLocationId : string;
  shipId ?: string;
}

export interface TravelParameters {
  destinationPlanetId : string;
}

export interface RefuelParameters {
  amount : number;
}

export interface AcceptContractParameters {
  contractId : string;
}

const pilotCreationDataSchema = Joi.object<PilotCreationData>({
  certification: Joi.string()
    .regex(/^\d{7}$/)
    .required(),

  name: Joi.string()
    .regex(/^([A-z]| )+$/)
    .max(255)
    .required(),
  
  age: Joi.number()
    .integer()
    .min(18)
    .required(),

  credits: Joi.string()
    .regex(precisionNumberRegex)
    .required(),

  currentLocationId: Joi.string()
    .required(),

  shipId: Joi.string()

}).required();

const refuelParametersSchema = Joi.object<RefuelParameters>({
  amount: Joi.number()
    .integer()
    .positive()
    .required()
}).required();

const aceeptContractParametersSchema = Joi.object<AcceptContractParameters>({
  contractId: Joi.string()
    .required()
}).required();

export class PilotsService {
  public static refuelCostPerUnit : Big = Big("7");

  public static async createPilot(pilotCreationData : PilotCreationData) : Promise<Pilot> {
    const {
      error,
      pilot
    } = await this.validatePilotCreationData(pilotCreationData);

    if(error.hasErrors()) {
      throw error;
    }

    const pilotsRepository = getRepository(Pilot);
    const createdPilot = pilotsRepository.create(pilot!);
    await pilotsRepository.save(createdPilot);

    return createdPilot;
  }

  private static async findShip(shipId ?: string) : Promise<Ship | undefined> {
    const shipsRepository = getRepository(Ship);
    const ship = await shipsRepository.findOne(shipId, {
      relations: ["pilot"]
    });

    return ship;
  }

  private static async findPlanet(planetId ?: string) : Promise<Planet | undefined> {
    const planetsRepository = getRepository(Planet);
    const planet = await planetsRepository.findOne(planetId);

    return planet;
  }

  private static async validatePilotCreationData(pilotCreationData : PilotCreationData) 
    : Promise<{ error : ValidationError, pilot ?: Pilot }> {
    

    const validationError = new ValidationError(
      "Invalid pilot creation data!",
      "InvalidPilotCreationData"
    );

    const { error } = pilotCreationDataSchema.validate(pilotCreationData);

    if(error) {
      validationError.addEntries(...error.details.map(entry => ({
        message: entry.message,
        code: `InvalidPilotCreationData${upperFirst(entry.context!.key)}`
      })));

      return {
        error: validationError
      };
    }

    const {
      certification,
      shipId,
      currentLocationId
    } = pilotCreationData;

    if(!isLuhnValid(certification)) {
      validationError.addEntries({
        message: "Invalid certification checksum!",
        code: `InvalidPilotCertificationChecksum`
      });

      return {
        error: validationError
      };
    }
    const ship = await this.findShip(shipId);
    const shipNotFound = shipId && !ship;
    if(shipNotFound) {
      validationError.addEntries({
        message: `There is not ship associated with this id "${shipId}"!`,
        code: "ShipNotFound"
      });

      return {
        error: validationError
      };
    }

    const shipHasOwner = ship?.pilot;
    if(shipHasOwner) {
      validationError.addEntries({
        message: `This ship already has an owner!`,
        code: "ShipAlreadyHasOwner"
      });

      return {
        error: validationError
      };
    }
    const currentLocation = await this.findPlanet(currentLocationId);
    if(!currentLocation) {
      validationError.addEntries({
        message: `There is no planet associated with this id "${currentLocationId}"!`,
        code: "PlanetNotFound"
      });

      return {
        error: validationError
      };
    }
    const pilotsRepository = getRepository(Pilot);
    const certificationAlreadyExists = await pilotsRepository.findOne({
      where: { certification }
    }) !== undefined;

    if(certificationAlreadyExists) {
      validationError.addEntries({
        message: `There is already a pilot with this certification "${certification}"!`,
        code: "CertificationAlreadyExists"
      });

      return {
        error: validationError
      };
    }
    
    const createdPilot = pilotsRepository.create(
      {
        ...pilotCreationData,
        ship,
        currentLocation
      }
    );

    return {
      error: validationError,
      pilot: createdPilot
    };
  }

  public static async travel(pilotId : string, 
                             travelParameters : TravelParameters) : Promise<Pilot> {
    const {
      destinationPlanetId
    } = travelParameters;

    const validationError = new ValidationError(
      "Travel error!",
      "TravelError"
    );

    const pilotsRepository = getRepository(Pilot);
    const pilot = await pilotsRepository.findOne(pilotId, {
      relations: ["ship", "currentLocation"]
    });

    if(!pilot) {
      validationError.addEntries({
        message: `There is no pilot associated with this id "${pilotId}"!`,
        code: "PilotNotFound"
      });

      throw validationError;
    }

    if(!pilot!.ship) {
      validationError.addEntries({
        message: `This pilot has no ship!`,
        code: "PilotHasNoShip"
      });

      throw validationError;
    }

    const planetsRepository = getRepository(Planet);
    const originPlanetId = pilot.currentLocationId;
    const originPlanet = pilot.currentLocation;
    const destinationPlanet = await planetsRepository.findOne(destinationPlanetId);

    if(originPlanetId === destinationPlanetId) {
      validationError.addEntries({
        message: `Origin and destination planets must be different!`,
        code: "OriginAndDestinationAreEqual"
      });

      throw validationError;
    }

    if(!destinationPlanet) {
      validationError.addEntries({
        message: `There is no planet associated with this id "${destinationPlanetId}"!`,
        code: "PlanetNotFound"
      });

      throw validationError;
    }

    const travellingDataRepository = getRepository(TravellingData);
    const travellingData = await travellingDataRepository.findOne({
      where: {
        originPlanetId,
        destinationPlanetId
      }
    });

    if(!travellingData) {
      validationError.addEntries({
        message: `It is not possible to travel from ${originPlanet!.name} to ${destinationPlanet!.name}`,
        code: "TravelImpossible"
      });

      throw validationError;
    }

    if(pilot.ship.fuelLevel < travellingData.fuelConsumption) {
      validationError.addEntries({
        message: `This travel requires ${travellingData.fuelConsumption} fuel units however the ship currently only has ${pilot.ship.fuelLevel}!`,
        code: "NotEnoughFuel"
      });

      throw validationError;
    }

    const contractsRepository = getRepository(Contract);
    const eligibleContracts = await contractsRepository.find({
      where: {
        contracteeId: pilot.id,
        fulfilledAt: IsNull(),
        originPlanetId,
        destinationPlanetId
      },
      relations: ["payload"]
    });

    pilot.ship.fuelLevel -= travellingData.fuelConsumption;
    pilot.currentLocation = destinationPlanet;
    eligibleContracts.forEach(contract => {
      pilot.credits = pilot.credits.plus(contract.value);
      contract.fulfilledAt = new Date().toISOString();
      contract.payload.forEach(resource => {
        pilot.ship!.currentWeight -= resource.weight;
      });
    });
    
    const shipsRepository = getRepository(Ship);
    await Promise.all([
      pilotsRepository.save(pilot),
      shipsRepository.save(pilot.ship),
      contractsRepository.save(eligibleContracts)
    ]);
    
    return pilot;
  }

  public static async refuel(pilotId : string, 
                             refuelParameters : RefuelParameters) : Promise<Pilot> {
    
    const {
      amount
    } = refuelParameters;

    const validationError = new ValidationError(
      "Invalid refuel tryout!",
      "InvalidRefuelTryout"
    );
    const { error } = refuelParametersSchema.validate(refuelParameters);

    if(error) {
      validationError.addEntries(...error.details.map(entry => ({
        message: entry.message,
        code: `InvalidRefuel${upperFirst(entry.context!.key)}`
      })));

      throw validationError;
    }

    const pilotsRepository = getRepository(Pilot);
    const pilot = await pilotsRepository.findOne(pilotId, {
      relations: ["ship"]
    });
    if(!pilot) {
      validationError.addEntries({
        message: `There is no pilot associated with this id "${pilotId}"!`,
        code: "PilotNotFound"
      });

      throw validationError;
    }

    const refuelCost = this.refuelCostPerUnit.times(Big(amount));
    if(pilot.credits.lt(refuelCost)) {
      validationError.addEntries({
        message: `The cost of the refuel is ${refuelCost.toJSON()} credits but this pilot currently only has ${pilot.credits.toJSON()}!`,
        code: "InsuficientCredits"
      });

      throw validationError;
    }

    const ship = pilot.ship;
    if(!ship) {
      validationError.addEntries({
        message: `This pilot has no ship!`,
        code: "PilotHasNoShip"
      });

      throw validationError;
    }

    const fuelDelta = ship.fuelCapacity - ship.fuelLevel;
    if(amount > fuelDelta) {
      validationError.addEntries({
        message: `The amount of fuel units (${amount}) is greater than the current amount this ship can receive (${fuelDelta})!`,
        code: "FuelOverflow"
      });

      throw validationError;
    }

    const refillsRepository = getRepository(Refill);
    const refill = refillsRepository.create({
      amount,
      pilotId: pilot.id
    });

    ship.fuelLevel += amount;
    pilot.credits = pilot.credits.minus(refuelCost);

    const shipsRepository = getRepository(Ship);
    await Promise.all([
      pilotsRepository.save(pilot),
      shipsRepository.save(ship),
      refillsRepository.save(refill)
    ]);

    return pilot;
  }

  public static async acceptContract(pilotId : string, 
                                     acceptContractParameters : AcceptContractParameters) : Promise<Contract> {
    
    const {
      contractId
    } = acceptContractParameters;
                                  
    const validationError = new ValidationError(
      "Unable to accept contract!",
      "UnableToAcceptContract"
    );
    const { error } = aceeptContractParametersSchema.validate(acceptContractParameters);

    if(error) {
      validationError.addEntries(...error.details.map(entry => ({
        message: entry.message,
        code: `InvalidAcceptContract${upperFirst(entry.context!.key)}`
      })));
                                  
      throw validationError;
    }

    const pilotsRepository = getRepository(Pilot);
    const pilot = await pilotsRepository.findOne(pilotId, {
      relations: ["ship"]
    });
    if(!pilot) {
      validationError.addEntries({
        message: `There is no pilot associated with this id "${pilotId}"!`,
        code: "PilotNotFound"
      });

      throw validationError;
    }

    const contractsRepository = getRepository(Contract);
    const contract = await contractsRepository.findOne(contractId, {
      relations: [
        "payload",
        "originPlanet",
        "destinationPlanet"
      ]
    });
    if(!contract) {
      validationError.addEntries({
        message: `There is no contract associated with this id "${pilotId}"!`,
        code: "ContractNotFound"
      });

      throw validationError;
    }

    if(contract.fulfilledAt) {
      validationError.addEntries({
        message: `This contract has already been fulfilled!`,
        code: "ContractAlreadyFulfilled"
      });

      throw validationError; 
    }

    const ship = pilot.ship;
    if(!ship) {
      validationError.addEntries({
        message: `This pilot has no ship and thus cannot accept a contract!`,
        code: "PilotHasNoShip"
      });

      throw validationError;
    }

    if(contract.originPlanetId !== pilot.currentLocationId) {
      validationError.addEntries({
        message: `A pilot must be in the contract's origin planet to accept it!`,
        code: "PilotCurrentLocationAndContractOriginPlanetMismatch"
      });

      throw validationError;
    }

    const weightDelta = ship.weightCapacity = ship.currentWeight;
    const payloadWeight = contract.payload
      .reduce((accum, resource) => accum + resource.weight, 0);
    if(weightDelta < payloadWeight) {
      validationError.addEntries({
        message: `The contract payload weight (${payloadWeight}) outweights the ship current's capacity (${weightDelta})!`,
        code: "ContractPayloadTooHeavy"
      });

      throw validationError;
    }

    ship.currentWeight += payloadWeight;
    contract.contractee = pilot;

    const shipsRepository = getRepository(Ship);
    await Promise.all([
      shipsRepository.save(ship),
      contractsRepository.save(contract)
    ]);

    return contract;
  }
}