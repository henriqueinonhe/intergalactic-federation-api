import { AxiosResponse } from "axios";
import { ContractCreationData, GetContractsQuery } from "../../src/services/ContractsService";
import { AcceptContractParameters, PilotCreationData, RefuelParameters, TravelParameters } from "../../src/services/PilotsService";
import { ResourceCreationData } from "../../src/services/ResourcesService";
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

export async function getPlanets() : Promise<AxiosResponse> {
  return await apiClient({
    url: `/planets`,
    method: "GET"
  });
}

export async function createResource(resourceCreationData : ResourceCreationData) : Promise<AxiosResponse> {
  return await apiClient({
    url: "/resources",
    method: "POST",
    data: resourceCreationData
  });
}

export async function refuel(pilotId : string, refuelParameters : RefuelParameters) : Promise<AxiosResponse> {
  return await apiClient({
    url: `/pilots/${pilotId}/refuel`,
    method: "PUT",
    data: refuelParameters
  });
}

export async function acceptContract(pilotId : string, acceptContractParameters : AcceptContractParameters) 
  : Promise<AxiosResponse> {
  return await apiClient({
    url: `/pilots/${pilotId}/acceptContract`,
    method: "PUT",
    data: acceptContractParameters
  });
}

export async function transactionsLedger() : Promise<AxiosResponse> {
  return await apiClient({
    url: `/reports/transactionsLedger`,
    method: "GET"
  });
}