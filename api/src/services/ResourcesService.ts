import Joi, { ValidationError } from "joi";
import { upperFirst } from "lodash";
import { getRepository } from "typeorm";
import { Resource } from "../entities/Resource";

export interface ResourceCreationData {
  name : string;
  weight : number;
}

const resourceCreationDataSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .required(),

  weight: Joi.number()
    .integer()
    .positive()
    .allow(0)
    .required()

}).required();

export class ResourcesService {
  public static async createResource(resourceCreationData : ResourceCreationData) : Promise<Resource> {
    const { error } = resourceCreationDataSchema.validate(resourceCreationData);

    if(error) {
      throw new ValidationError(
        "Invalid resource creation data!",
        "InvalidResourceCreationData",
        error.details.map(entry => ({
          message: entry.message,
          code: `InvalidPilotCreationData${upperFirst(entry.context!.key)}`
        }))
      );
    }

    const resourcesRepository = getRepository(Resource);
    const createdResource = resourcesRepository.create(resourceCreationData);
    resourcesRepository.save(createdResource);

    return createdResource;
  }
}
