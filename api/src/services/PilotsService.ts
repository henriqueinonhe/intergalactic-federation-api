import Joi from "joi";
import { capitalize } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { Contract } from "../entities/Contract";
import { Pilot } from "../entities/Pilot";
import { Planet } from "../entities/Planet";
import { Ship } from "../entities/Ship";
import { TravellingData } from "../entities/TravellingData";
import { ValidationErrorEntry, ValidationError } from "../exceptions/ValidationError";
import { isLuhnValid } from "../helpers/luhn";
import { precisionNumberRegex } from "../helpers/precisionNumbers";

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
  contractId : number;
}

const pilotCreationDataSchema = Joi.object({
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

export class PilotsService {
  public static async createPilot(pilotCreationData : PilotCreationData) : Promise<Pilot> {
    const {
      error,
      pilot
    } = await this.validatePilotCreationData(pilotCreationData);

    if(error.hasErrors()) {
      throw error;
    }

    const pilotsRepository = getRepository(Pilot);
    await pilotsRepository.save(pilot);

    return pilot;
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
    : Promise<{ error : ValidationError, pilot : Pilot }> {
    
    const { error } = pilotCreationDataSchema.validate(pilotCreationData);

    const validationErrorEntries : Array<ValidationErrorEntry> = [];

    if(error) {
      validationErrorEntries.push(...error.details.map(entry => ({
        message: entry.message,
        code: `InvalidPilotCreationData${capitalize(entry.context!.key)}`
      })));
    }

    const {
      certification,
      shipId,
      currentLocationId
    } = pilotCreationData;

    if(!isLuhnValid(certification)) {
      validationErrorEntries.push({
        message: "Invalid certification checksum!",
        code: `InvalidPilotCertificationChecksum`
      });
    }

    const ship = await this.findShip(shipId);
    const shipNotFound = shipId && !ship;
    if(shipNotFound) {
      validationErrorEntries.push({
        message: `There is not ship associated with this id "${shipId}"!`,
        code: "ShipNotFound"
      });
    }

    const shipHasOwner = ship?.pilot !== null;
    if(shipHasOwner) {
      validationErrorEntries.push({
        message: `This ship already has an owner!`,
        code: "ShipAlreadyHasOwner"
      });
    }

    const currentLocation = await this.findPlanet(currentLocationId);
    if(!currentLocation) {
      validationErrorEntries.push({
        message: `There is no planet associated with this id "${currentLocationId}"!`,
        code: "PlanetNotFound"
      });
    }

    const pilotsRepository = getRepository(Pilot);
    const certificationAlreadyExists = await pilotsRepository.findOne({
      where: { certification }
    }) !== undefined;

    if(certificationAlreadyExists) {
      validationErrorEntries.push({
        message: `There is already a pilot with this certification "${certification}"!`,
        code: "CertificationAlreadyExists"
      });
    }
    
    const validationError = new ValidationError(
      "Invalid pilot creation data!",
      "InvalidPilotCreationData",
      validationErrorEntries
    );
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
      validationError.addEntry({
        message: `There is no pilot associated with this id "${pilotId}"!`,
        code: "PilotNotFound"
      });

      throw validationError;
    }

    if(!pilot!.ship) {
      validationError.addEntry({
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
      validationError.addEntry({
        message: `Origin and destination planets must be different!`,
        code: "OriginAndDestinationAreEqual"
      });

      throw validationError;
    }

    if(!originPlanet) {
      validationError.addEntry({
        message: `There is no planet associated with this id "${originPlanetId}"!`,
        code: "PlanetNotFound"
      });

      throw validationError;
    }

    if(!destinationPlanet) {
      validationError.addEntry({
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
      validationError.addEntry({
        message: `It is not possible to travel from ${originPlanet!.name} to ${destinationPlanet!.name}`,
        code: "TravelImpossible"
      });

      throw validationError;
    }

    if(pilot.ship.fuelLevel < travellingData.fuelConsumption) {
      validationError.addEntry({
        message: `This travel requires ${travellingData.fuelConsumption} fuel \
        units however the ship currently only has ${pilot.ship.fuelLevel}!`,
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
      // pilot.credits NEED LIBRARY TO HANDLE MONEY
      contract.fulfilledAt = new Date().toISOString();
      contract.payload.forEach(resource => {
        pilot.ship!.currentWeight -= resource.weight;
      });
    });
    
    return pilot;
  }

  public static async refuel(pilotId : string, 
                             refuelParameters : RefuelParameters) : Promise<Pilot> {
    //TODO
    return {} as any;
  }

  public static async acceptContract(pilotId : string, 
                                     acceptContractParameters : AcceptContractParameters) : Promise<Contract> {
    //TODO
    return {} as any;
  }
}