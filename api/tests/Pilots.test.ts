/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { sample, random as randomNumber } from "lodash";
import { getConnection, IsNull, Not, SimpleConsoleLogger } from "typeorm";
import { Pilot } from "../src/entities/Pilot";
import { Planet } from "../src/entities/Planet";
import { PilotCreationData } from "../src/services/PilotsService";
import { apiClient } from "./testHelpers/apiClient";
import { clearDb, connection, populateDb, close } from "./testHelpers/db";
import { randomList, randomPilotCreationData } from "./testHelpers/random";
import { checkHasValidationErrorEntryCode } from "./testHelpers/validationErrors";
import { v4 as uuid } from "uuid";
import { Ship } from "../src/entities/Ship";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  await close();
});

describe("Create Pilot", () => {
  beforeAll(async () => {
    await populateDb();
  });
  
  afterAll(async () => {
    await clearDb();
  });

  async function createPilot(pilotCreationData : PilotCreationData) : Promise<AxiosResponse> {
    return await apiClient({
      url: "/pilots",
      method: "POST",
      data: pilotCreationData
    });
  }

  async function randomPilotCreationDataWithDefaults() : Promise<PilotCreationData> {
    const connection = getConnection("Test Connection");
    const planetsRepository = connection.getRepository(Planet);
    const existingPlanets = await planetsRepository.find({});
    
    return randomPilotCreationData(sample(existingPlanets)!.id);
  }

  describe("Pre Conditions", () => {

    const invalidPilotCertifications = [
      79927398713,
      "5456145asdasd6134234",
      null,
      {},
      [],
      ["sdasdasd"],
      ""
    ];
    test.each(invalidPilotCertifications)(
      "Pilot certification must be a string with length 7 composed solely of digits, case %s", 
      async (invalidPilotCertification) => {

        const response = await createPilot({
          ...await randomPilotCreationDataWithDefaults(),
          certification: invalidPilotCertification as any
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidPilotCreationDataCertification"));
      }
    );

    const pilotCertificationsWithInvalidChecksums = [
      "79927398710",
      "79927398711",
      "79927398712",
      "79927398714",
      "79927398715",
      "79927398716",
      "79927398717",
      "79927398718",
      "79927398719"
    ];
    test.each(pilotCertificationsWithInvalidChecksums)(
      "Pilot certification must have a valid Luhn's checksum, case %s", 
      async (pilotCertificationWithInvalidChecksum) => {

        const response = await createPilot({
          ...await randomPilotCreationDataWithDefaults(),
          certification: pilotCertificationWithInvalidChecksum
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidPilotCertificationChecksum"));
      }
    );

    test("Pilot certification must be unique among pilots", async () => {
      const connection = getConnection("Test Connection");
      const pilotsRepository = connection.getRepository(Pilot);
      const existingPilots = await pilotsRepository.find({take: 10});
      const existingCertifications = existingPilots.map(pilot => pilot.certification);

      const responses = await Promise.all(existingCertifications
        .map(async certification => createPilot({
          ... await randomPilotCreationDataWithDefaults(),
          certification: certification!
        })));
      
      responses.forEach(response => {
        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "CertificationAlreadyExists"));
      });
    });

    const invalidPilotNames = [
      234,
      "",
      "sadasd 3",
      "das*asdasd",
      null,
      {},
      []
    ];
    test.each(invalidPilotNames)(
      "Pilot name must be a non empty string composed solely of letters and whitespace, case %s", 
      async (invalidPilotName) => {
        const response = await createPilot({
          ... await randomPilotCreationDataWithDefaults(),
          name: invalidPilotName as any
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidPilotCreationDataName"));
      }
    );

    const invalidPilotAges = [
      -24,
      17,
      0,
      null,
      {},
      []
    ];
    test.each(invalidPilotAges)(
      "Pilot age must be an integer greater or equal than 18, case %s", 
      async (invalidPilotAge) => {
        const response = await createPilot({
          ... await randomPilotCreationDataWithDefaults(),
          age: invalidPilotAge as any
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidPilotCreationDataAge"));
      }
    );

    const invalidDecimals = [
      ...randomList(() => randomNumber(-10000, 10000), 20),
      ".45345",
      ""
    ];
    test.each(invalidDecimals)(
      "Pilot credits must be a decimal, case %s", 
      async (invalidDecimal) => {
        const response = await createPilot({
          ...await randomPilotCreationDataWithDefaults(),
          credits: invalidDecimal as any
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidPilotCreationCredits"));
      }
    );

    const invalidCurrentLocationIds = [
      "",
      "asdasd",
      0,
      234234,
      null,
      {},
      [],
      [1, 4, 2],
      [1, "adsasd"]
    ];
    test.each(invalidCurrentLocationIds)(
      "Pilot current location id must be a non empty string, case %s", 
      async (invalidCurrentLocationId) => {
        const response =  await createPilot({
          ... await randomPilotCreationDataWithDefaults(),
          currentLocationId: invalidCurrentLocationId as any
        });

        expect(response.status).toBe(422);
      }
    );

    const planetsThereNeverWereIds = randomList(uuid, 2);
    test.each(planetsThereNeverWereIds)(
      "Pilot current location id must reference an existing planet, case %s", 
      async (planetThatNeverWasId) => {
        const response = await createPilot({
          ...await randomPilotCreationDataWithDefaults(),
          currentLocationId: planetThatNeverWasId
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "PlanetNotFound"));
      }
    );

    const invalidPilotShipIds = [
      {},
      [],
      true
    ];
    test.each(invalidPilotShipIds)(
      "Pilot ship id must either be undefined, null or a string, case %s", 
      async (invalidPilotShipId) => {
        const response = await createPilot({
          ...await randomPilotCreationDataWithDefaults(),
          shipId: invalidPilotShipId as any
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidPilotCreationDataShipId"));
      }
    );

    const shipsThatNeverWereIds = randomList(uuid, 10);
    test.each(shipsThatNeverWereIds)(
      "Pilot ship id, when not a nullable value, must reference an existing ship, %s", 
      async (shipThatNeverWasId) => {
        const response = await createPilot({
          ...await randomPilotCreationDataWithDefaults(),
          shipId: shipThatNeverWasId
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "ShipNotFound"));
      }
    );

    test("Pilot ship id, when not a nullable value, must reference a ship that is unowned", async () => {
      const connection = getConnection("Test Connection");
      const pilotsRepository = connection.getRepository(Pilot);
      const ownedShipsIds = (await pilotsRepository.find({
        select: ["shipId"],
        where: { shipId: Not(IsNull()) }
      })).map(pilot => pilot.shipId);

      const responses = await Promise.all(ownedShipsIds
        .map(async ownedShipId => createPilot({
          ...await randomPilotCreationDataWithDefaults(),
          shipId: ownedShipId!
        })));
      
      responses.forEach(response => {
        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "ShipAlreadyHasOwner"));
      });
    });
  });

  describe("Post Conditions", () => {
    test("Pilot is properly created", async () => {
      const connection = getConnection("Test Connection");
      const unownedShips = await connection.query(`
        SELECT Ships.id, Pilots.shipId FROM Pilots
        RIGHT JOIN Ships ON Ships.id = Pilots.shipId 
        WHERE shipId IS NULL
      `);

      const pilotCreationData = {
        ...await randomPilotCreationDataWithDefaults(),
        shipId: sample(unownedShips)!.id
      };

      const response = await createPilot(pilotCreationData);
      expect(response.status).toBe(201);

      const createdPilot = response.data;
      expect(createdPilot).toMatchObject(pilotCreationData);
    });
  });
});

describe("Travel", () => {
  describe("Pre Conditions", () => {
    test("Pilot id parameter must reference an existing pilot", async () => {
      //TODO
    });

    test("The referenced pilot must own a ship", async () => {
      //TODO
    });

    test("Destination planet id parameter must reference an existing planet", async () => {
      //TODO
    });

    test("Origin and destination planet must be different", async () => {
      //TODO
    });

    test("It must be possible to travel from the origin planet to the destination planet", async () => {
      //TODO
    });

    test("There must be enough fuel in the ship", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Ship fuel level is updated", async () => {
      //TODO
    });

    test("Pilot current location is updated", async () => {
      //TODO
    });

    test("Eligible contracts are closed", async () => {
      //TODO
    });
  });
});

describe("Refuel", () => {
  describe("Pre Conditions", () => {
    test("Amount must be a positive integer", async () => {
      //TODO
    });

    test("Pilot id must reference an existing pilot", async () => {
      //TODO
    });

    test("The referenced pilot must own a ship", async () => {
      //TODO
    });

    test("The referenced pilot must have sufficient funds for the refuel", async () => {
      //TODO
    });

    test("Ship must have enough room for the new fuel", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Refill entry is properly created", async () => {
      //TODO
    });

    test("Ship fuel level is updated", async () => {
      //TODO
    });

    test("Pilot credits is updated", async () => {
      //TODO
    });
  });
});

describe("Accept Contract", () => {
  describe("Pre Conditions", () => {
    test("Pilot id must reference an existing pilot", async () => {
      //TODO
    });

    test("Referenced pilot must own a ship", async () => {
      //TODO
    });

    test("Contract id must reference an existing contract", async () => {
      //TODO
    });

    test("Contract must be still open", async () => {
      //TODO
    });

    test("Pilot must be in the contract's origin planet to accept it", async () => {
      //TODO
    });

    test("Contract's payload weight must be within the current ship capacity", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Ship weight is updated", async () => {
      //TODO
    });

    test("Contract contractee is updated", async () => {
      //TODO
    });
  });
});