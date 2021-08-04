import Joi from "joi";
import { upperFirst, zip } from "lodash";
import { getRepository, IsNull, Not } from "typeorm";
import { Contract } from "../entities/Contract";
import { Planet } from "../entities/Planet";
import { Resource } from "../entities/Resource";
import { ValidationError, ValidationErrorEntry } from "../exceptions/ValidationError";
import { PaginatedEntity } from "../helpers/paginatedEntity";
import { precisionNumberRegex } from "../helpers/precisionNumbers";

export interface ContractCreationData {
  description : string;
  payloadIds : Array<string>;
  originPlanetId : string;
  destinationPlanetId : string;
  value : string;
}

export type ContractStatus = "Any" | "Open" | "Fulfilled" | "In Effect";

export interface GetContractsQuery {
  status ?: ContractStatus;
}

const contractCreationDataSchema = Joi.object({
  description: Joi.string()
    .max(255)
    .required(),

  payloadIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),
  
  originPlanetId: Joi.string()
    .required(),
  
  destinationPlanetId: Joi.string()
    .not(Joi.ref("originPlanetId"))
    .required(),

  value: Joi.string()
    .regex(precisionNumberRegex)
    .required()
  
}).required();

const getContractQuerySchema = Joi.object({
  status: Joi.array()
    .valid("Any", "Open", "Fulfilled", "In Effect")
});

export class ContractsService {
  public static async createContract(contractCreationData : ContractCreationData) : Promise<Contract> {
    const {
      error,
      contract
    } = await this.validateConctractCreationData(contractCreationData);

    if(error.hasErrors()) {
      throw error;
    }

    const contractsRepository = getRepository(Contract);
    const resourcesRepository = getRepository(Resource);

    const createdContract = await contractsRepository.save(contract);
    createdContract.payload.forEach(async resource => {
      resource.contractId = createdContract.id;
    });
    await Promise.all(createdContract.payload.map(resource => resourcesRepository.save(resource)));

    return createdContract;
  }

  //FIXME EXTRACT TO Planets Service
  private static async findPlanet(planetId ?: string) : Promise<Planet | undefined> {
    const planetsRepository = getRepository(Planet);
    const planet = await planetsRepository.findOne(planetId);

    return planet;
  }

  private static async validatePayload(payloadIds : Array<string>) 
    : Promise<{ errors : Array<ValidationErrorEntry>, resources : Array<Resource> }> {

    const validationErrorEntries : Array<ValidationErrorEntry> = [];
    const resourcesRepository = getRepository(Resource);
    const resources = await resourcesRepository.findByIds(payloadIds);

    const resourcesWithMetadata = zip(payloadIds, resources);

    const resourcesNotFound = resourcesWithMetadata
      .filter(([, resource]) => resource === undefined);
    validationErrorEntries.push(
      ...resourcesNotFound.map(([payloadId]) => ({
        message: `There is no resource associated with this id "${payloadId}"!`,
        code: "ResourceNotFound"
      }))
    );

    const resourcesAlreadyWithContract = resourcesWithMetadata
      .filter(([, resource]) => resource?.contractId !== null);
    validationErrorEntries.push(
      ...resourcesAlreadyWithContract.map(([payloadId, resource]) => ({
        message: `This resource ("${payloadId}") is already associated with a contract (contractId: "${resource?.contractId}")!`,
        code: "ResourceAlreadyAssociatedWithContract"
      }))
    );

    return {
      errors: validationErrorEntries,
      resources
    };
  }

  private static async validateConctractCreationData(contractCreationData : ContractCreationData) 
    : Promise<{ error : ValidationError, contract : Contract }> {

    const { error } = contractCreationDataSchema.validate(contractCreationData);

    const validationErrorEntries : Array<ValidationErrorEntry> = [];

    if(error) {
      validationErrorEntries.push(...error.details.map(entry => ({
        message: entry.message,
        code: `InvalidContractCreationData${upperFirst(entry.context!.key)}`
      })));
    }

    const {
      payloadIds: payload,
      originPlanetId,
      destinationPlanetId
    } = contractCreationData;

    const {
      errors: resourcesErrors,
      resources
    } = await this.validatePayload(payload);

    validationErrorEntries.push(...resourcesErrors);

    const originPlanet = await this.findPlanet(originPlanetId);
    if(!originPlanet) {
      validationErrorEntries.push({
        message: `There is no planet associated with this id "${originPlanetId}"!`,
        code: "PlanetNotFound"
      });
    }

    const destinationPlanet = await this.findPlanet(destinationPlanetId);
    if(!destinationPlanet) {
      validationErrorEntries.push({
        message: `There is no planet associated with this id "${destinationPlanetId}"!`,
        code: "PlanetNotFound"
      });
    }

    const contractsRepository = getRepository(Contract);
    const contract = contractsRepository.create({
      ...contractCreationData,
      originPlanet,
      destinationPlanet,
      payload: resources
    });
    
    return {
      error: new ValidationError(
        "Invalid contract creation data!",
        "InvalidContractCreationData",
        validationErrorEntries
      ),
      contract
    };
  }

  private static async validateGetContractsQuery(query ?: GetContractsQuery) : Promise<ValidationError> {
    const validationErrorEntries : Array<ValidationErrorEntry> = [];

    const { error } = getContractQuerySchema.validate(query);

    if(error) {
      validationErrorEntries.push(...error.details.map(entry => ({
        message: entry.message,
        code: `InvalidContractCreationData${upperFirst(entry.context!.key)}`
      })));
    }

    return new ValidationError(
      "Invalid query!",
      "InvalidGetContractsQuery",
      validationErrorEntries
    );
  }

  public static async getContracts(query ?: GetContractsQuery) : Promise<PaginatedEntity<Contract>> {
    const error = await this.validateGetContractsQuery(query);

    if(error.hasErrors()) {
      throw error;
    }

    const {
      status = "Any"
    } = query ?? {};

    const whereClause = (() => {
      switch(status) {
      case "Any":
        return {};
  
      case "Fulfilled":
        return {
          fulfilledAt: Not(IsNull())
        };
        
      case "In Effect":
        return {
          contracteeId: Not(IsNull()),
          fulfilledAt: IsNull()
        };
  
      case "Open":
        return {
          contracteeId: IsNull()
        };
      }
    })();
    
    const contractsRepository = getRepository(Contract);
    const contracts = await contractsRepository.find({
      where: whereClause,
      order: {
        createdAt: "DESC"
      }
    });

    //TODO Pagination
    return contracts  as any;
  }
}