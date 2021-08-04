import { Ship } from "../../src/entities/Ship";
import { ShipCreationData } from "../../src/services/ShipsService";
import { random as randomNumber } from "lodash";
import RandExp from "randexp";

export function randomMonthString() : string {
  return new RandExp(/(0[1-9])|10|11|12/).gen();
}

export function randomDayString() : string {
  return new RandExp(/(0[1-9])|((1|2)[0-9])/).gen();
}

export function randomDate() : string {
  return `${randomNumber(2000, 2020)}-${randomMonthString()}-${randomDayString()}`;
}

export function randomList<T>(generator : () => T, length : number) : Array<T> {
  return new Array(length).fill(null).map(() => generator());
}

export function randomShipCreationData() : ShipCreationData {
  const weightCapacity = randomNumber(1, 10000);
  const fuelCapacity = randomNumber(1, 10000);
  const currentWeight = randomNumber(weightCapacity, 10000);
  const fuelLevel = randomNumber(fuelCapacity, 10000);

  return {
    weightCapacity,
    fuelCapacity,
    currentWeight,
    fuelLevel
  };
}