import { AxiosResponse } from "axios";
import { ContractCreationData, GetContractsQuery } from "../../src/services/ContractsService";
import { PilotCreationData, TravelParameters } from "../../src/services/PilotsService";
import { ShipCreationData } from "../../src/services/ShipsService";
import { apiClient } from "./apiClient";

export async function createContract(contractCreationData : ContractCreationData) : Promise<AxiosResponse>  {
  return await apiClient.request({
    url: "/contracts",
    method: "POST",
    data: contractCreationData
  });
}

export async function getContracts(query ?: GetContractsQuery) : Promise<AxiosResponse> {
  return await apiClient.request({
    url: "/contracts",
    method: "GET",
    params: query
  });
}

export async function createShip(shipCreationData : ShipCreationData) : Promise<AxiosResponse> {
  return await apiClient.request({
    url: "/ships",
    method: "POST",
    data: shipCreationData
  });
}

export async function createPilot(pilotCreationData : PilotCreationData) : Promise<AxiosResponse> {
  return await apiClient({
    url: "/pilots",
    method: "POST",
    data: pilotCreationData
  });
}

export async function travel(pilotId : string, travelParameters : TravelParameters) : Promise<AxiosResponse> {
  return await apiClient({
    url: `/pilots/${pilotId}/travel`,
    method: "PUT",
    data: travelParameters
  });
}