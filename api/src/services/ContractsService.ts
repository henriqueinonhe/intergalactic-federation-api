import { Contract } from "../entities/Contract";
import { PaginatedEntity } from "../helpers/paginatedEntity";

export interface ContractCreationData {

}

export interface GetContractsQuery {

}

export class ContractsService {
  public static async createContract(contractCreationData : ContractCreationData) : Promise<Contract> {
    return {} as any;
  }

  public static async getContracts(query ?: GetContractsQuery) : Promise<PaginatedEntity<Contract>> {
    return {} as any;
  }
}