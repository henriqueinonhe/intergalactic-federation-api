import { Ship } from "../entities/Ship";
import { ValidationError, ValidationErrorEntry } from "../exceptions/ValidationError";
import Joi from "joi";
import { capitalize } from "lodash";
import { getRepository } from "typeorm";

export interface ShipCreationData {
  fuelCapacity : number;
  fuelLevel : number;
  weightCapacity : number;
  currentWeight : number;
}

const shipCreationDataSchema = Joi.object<ShipCreationData>({
  fuelCapacity: Joi.number()
    .integer()
    .positive()
    .required(),

  fuelLevel: Joi.number()
    .integer()
    .positive()
    .allow(0)
    .max(Joi.ref("fuelCapacity"))
    .required(),

  weightCapacity: Joi.number()
    .integer()
    .positive()
    .required(),

  currentWeight: Joi.number()
    .integer()
    .positive()
    .max(Joi.ref("weightCapacity"))
    .required()

}).required();
export class ShipsService {
  public static async createShip(shipCreationData : ShipCreationData) : Promise<Ship> {
    const validationErrorEntries = this.validateShipCreationData(shipCreationData);
    if(validationErrorEntries.length !== 0) {
      throw new ValidationError(
        "Invalid ship creation data!", 
        "InvalidShipCreationData",
        validationErrorEntries
      );
    }

    const shipsRepository = getRepository(Ship);
    const createdShip = shipsRepository.create(shipCreationData);
    await shipsRepository.save(createdShip);

    return createdShip;
  }

  private static validateShipCreationData(shipCreationData : ShipCreationData) : Array<ValidationErrorEntry> {
    const { error } = shipCreationDataSchema.validate(shipCreationData);

    if(error) {
      return error.details.map(entry => ({
        message: entry.message,
        code: `InvalidShipCreationData${capitalize(entry.context!.key)}`
      }));
    }

    return [];
  }
}