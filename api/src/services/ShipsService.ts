import { Ship } from "../entities/Ship";

export interface ShipCreationData {

}
export class ShipsService {
  public static async createShip(shipCreationData : ShipCreationData) : Promise<Ship> {
    //TODO
    return {} as any;
  }
}