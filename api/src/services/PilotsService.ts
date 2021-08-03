import { Contract } from "../entities/Contract";
import { Pilot } from "../entities/Pilot";

export interface PilotCreationData {

}

export class PilotsService {
  public static async createPilot(pilotCreationData : PilotCreationData) : Promise<Pilot> {
    //TODO
    return {} as any;
  }

  public static async travel(pilotId : string,
                             originPlanetId : string,
                             destinationPlanetId : string) : Promise<Pilot> {
    //TODO
    return {} as any;
  }

  public static async refuel(pilotId : string, amount : number) : Promise<Pilot> {
    //TODO
    return {} as any;
  }

  public static async acceptContract(pilotId : string, contractId : string) : Promise<Contract> {
    //TODO
    return {} as any;
  }
}