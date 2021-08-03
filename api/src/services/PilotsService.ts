import Joi from "joi";
import { capitalize } from "lodash";
import { getRepository } from "typeorm";
import { Contract } from "../entities/Contract";
import { Pilot } from "../entities/Pilot";
import { Planet } from "../entities/Planet";
import { Ship } from "../entities/Ship";
import { ValidationErrorEntry, ValidationError } from "../exceptions/ValidationError";

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
    .required(),
  
  age: Joi.number()
    .integer()
    .min(18)
    .required(),

  credits: Joi.string()
    .regex(/^\d{0,21}(\.\d{1,4})?$/)
    .required(),

  currentLocationId: Joi.string()
    .required(),

  shipId: Joi.string()

}).required();

export class PilotsService {
  public static async createPilot(pilotCreationData : PilotCreationData) : Promise<Pilot> {
    const {
      errors,
      ship
    } = await this.validatePilotCreationData(pilotCreationData);

    if(errors.length !== 0) {
      throw new ValidationError("Invalid pilot creation data!",
                                "InvalidPilotCreationData",
                                errors);
    }

    const pilotsRepository = getRepository(Pilot);
    const createdPilot = pilotsRepository.create(pilotCreationData);
    await pilotsRepository.save(createdPilot);

    createdPilot.ship = ship ?? null;
    return createdPilot;
  }

  private static async tryToFindShip(shipId ?: string) : Promise<Ship | undefined> {
    const shipsRepository = getRepository(Ship);
    const ship = await shipsRepository.findOne(shipId);

    return ship;
  }

  private static async tryToFindPlanet(planetId : string) : Promise<Planet | undefined> {
    const planetsRepository = getRepository(Planet);
  }

  private static async validatePilotCreationData(pilotCreationData : PilotCreationData) 
    : Promise<{ errors : Array<ValidationErrorEntry>, ship ?: Ship }> {
    
    const { error } = pilotCreationDataSchema.validate(pilotCreationData);

    if(error) {
      return {
        errors: error.details.map(entry => ({
          message: entry.message,
          code: `InvalidPilotCreationData${capitalize(entry.context!.key)}`
        }))
      };
    }

    const ship = await this.tryToFindShip(pilotCreationData.shipId);
    const shipNotFound = pilotCreationData.shipId && !ship;
    if(shipNotFound) {
      const error : ValidationErrorEntry = {
        message: `There is not ship associated with this id "${pilotCreationData.shipId}"!`,
        code: "InvalidShip"
      };

      return {
        errors: [error]
      };
    }

    return {
      errors: [],
      ship
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