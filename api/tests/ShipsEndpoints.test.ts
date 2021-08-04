import { ShipCreationData } from "../src/services/ShipsService";
import { apiClient } from "./testHelpers/apiClient";
import { clearDb, connection, populateDb, close } from "./testHelpers/db";
import { AxiosResponse } from "axios";
import { randomList, randomShipCreationData } from "./testHelpers/random";
import { random as randomNumber } from "lodash";
import { checkHasValidationErrorEntryCode } from "./testHelpers/validationErrors";
import { DeepPartial, getConnection } from "typeorm";
import { Ship } from "../src/entities/Ship";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  await close();
});

describe("Create Ship", () => {
  beforeAll(async () => {
    await populateDb();
  });
  
  afterAll(async () => {
    await clearDb();
  });

  const createShip = async (shipCreationData : ShipCreationData) : Promise<AxiosResponse> => {
    return await apiClient.request({
      url: "/ships",
      method: "POST",
      data: shipCreationData
    });
  }; 

  describe("Pre Conditions", () => {

    const invalidFuelCapacities = [
      0,
      ...randomList(() => randomNumber(-100, 0), 10)
    ];

    test.each(invalidFuelCapacities)(
      "Fuel capacity must be a positive integer, case %s", 
      async (invalidFuelCapacity) => {

        const response = await createShip({
          ...randomShipCreationData(),
          fuelCapacity: invalidFuelCapacity
        });
        
        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidShipCreationDataFuelCapacity")).toBe(true);
      }
    );

    const invalidFuelLevelsShipCreationData = randomShipCreationData();
    const invalidFuelLevels = [
      ...randomList(() => randomNumber(-100, 0), 5),
      ...randomList(() => randomNumber(invalidFuelLevelsShipCreationData.fuelCapacity + 1, 
                                       2 * invalidFuelLevelsShipCreationData.fuelCapacity), 5)
    ];

    test.each(invalidFuelLevels)(
      "Fuel level must be a zero or positive integer and less than fuel capacity, case %s", 
      async (invalidFuelLevel) => {
      
        const response = await createShip({
          ...invalidFuelLevelsShipCreationData,
          fuelLevel: invalidFuelLevel
        });
        
        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidShipCreationDataFuelLevel")).toBe(true);
      }
    );

    const invalidWeightCapacities = [
      0,
      ...randomList(() => randomNumber(-100, 0), 10)
    ];

    test.each(invalidWeightCapacities)(
      "Weight capacity must be a positive integer, case %s",
      async (invalidWeightCapacity) => {
        const response = await createShip({
          ...randomShipCreationData(),
          weightCapacity: invalidWeightCapacity
        });
        
        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidShipCreationDataWeightCapacity")).toBe(true);
      }
    );

    const invalidCurrentWeightShipCreationData = randomShipCreationData();
    const invalidCurrentWeights = [
      ...randomList(() => randomNumber(-100, 0), 5),
      ...randomList(() => randomNumber(invalidCurrentWeightShipCreationData.weightCapacity + 1, 
                                       2 * invalidCurrentWeightShipCreationData.weightCapacity), 5)
    ];
    
    test.each(invalidCurrentWeights)(
      "Current weight must be a zero or positive integer and less than weight capacity, case %s", 
      async (invaldiCurrentWeight) => {
        const response = await createShip({
          ...invalidCurrentWeightShipCreationData,
          currentWeight: invaldiCurrentWeight
        });
      
        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidShipCreationDataCurrentWeight")).toBe(true);
      }
    );
  });

  describe("Post Conditions", () => {
    test("Ship is successfully created", async () => {
      function formatShips(ships : Array<Ship>) : Array<DeepPartial<Ship>> {
        return ships.map(s => {
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            createdAt,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            updatedAt,
            ...shipWithNoTimestamps
          } = s;

          return shipWithNoTimestamps;
        });
      }

      const connection = getConnection("Test Connection");
      const shipsRepository = connection.getRepository(Ship);
      const preExistingShips = formatShips(await shipsRepository.find({}));
      const newShipsCreationData = randomList(randomShipCreationData, 40);

      const responses = await Promise.all(
        newShipsCreationData.map(data => createShip(data))
      );

      const createdShips = formatShips(responses.map(response => shipsRepository.create(response.data as Ship)));
      const existingShips = formatShips(await shipsRepository.find({}));

      [...preExistingShips, ...createdShips].forEach(ship => {
        expect(existingShips.filter(e => e.id === ship.id)).toContainEqual(ship);
      });
    });
  });
});