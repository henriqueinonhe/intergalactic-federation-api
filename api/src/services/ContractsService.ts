import Joi from "joi";
import { Contract } from "../entities/Contract";
import { ValidationError } from "../exceptions/ValidationError";
import { PaginatedEntity } from "../helpers/paginatedEntity";
import { precisionNumberRegex } from "../helpers/precisionNumbers";

export interface ContractCreationData {
  description : string;
  payload : Array<string>;
  originPlanetId : string;
  destinationPlanetId : string;
  value : string;
}

export type ContractStatus = "Open" | "Fulfilled" | "In Effect";

export interface GetContractsQuery {
  status ?: Array<ContractStatus>;
}

const contractCreationDataSchema = Joi.object({
  description: Joi.string()
    .max(255)
    .required(),

  payload: Joi.array()
    .items(Joi.string())
    .required(),
  
  originPlanetId: Joi.string()
    .required(),
  
  destinationPlanetId: Joi.string()
    .required(),

  value: Joi.string()
    .regex(precisionNumberRegex)
    .required()
  
}).required();

const getContractQuerySchema = Joi.object({
  status: Joi.array()
    .items(Joi.string())
});

export class ContractsService {
  public static async createContract(contractCreationData : ContractCreationData) : Promise<Contract> {
    return {} as any;
  }

  private static validateConctractCreationData(contractCreationData : ContractCreationData) 
    : Promise<{ error : ValidationError, contract : Contract }> {

  }

  public static async getContracts(query ?: GetContractsQuery) : Promise<PaginatedEntity<Contract>> {
    return {} as any;
  }
}