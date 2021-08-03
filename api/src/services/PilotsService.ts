import Joi from "joi";
import { capitalize } from "lodash";
import { getRepository } from "typeorm";
import { Contract } from "../entities/Contract";
import { Pilot } from "../entities/Pilot";
import { Planet } from "../entities/Planet";
import { Ship } from "../entities/Ship";
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
  originPlanetId : string;
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
    //TODO
    return {} as any;
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