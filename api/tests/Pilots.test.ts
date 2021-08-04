/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { sample, random as randomNumber } from "lodash";
import { getConnection, getRepository, IsNull, Not, SimpleConsoleLogger } from "typeorm";
import { Pilot } from "../src/entities/Pilot";
import { Planet } from "../src/entities/Planet";
import { PilotCreationData, TravelParameters } from "../src/services/PilotsService";
import { apiClient } from "./testHelpers/apiClient";
import { clearDb, connection, populateDb, close } from "./testHelpers/db";
import { randomList, randomPilotCreationData } from "./testHelpers/random";
import { checkHasValidationErrorEntryCode } from "./testHelpers/validationErrors";
import { v4 as uuid } from "uuid";
import { Ship } from "../src/entities/Ship";
import { TravellingData } from "../src/entities/TravellingData";
import { Contract } from "../src/entities/Contract";

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
  beforeAll(async () => {
    await populateDb();
  });
  
  afterAll(async () => {
    await clearDb();
  });

  async function travel(pilotId : string, travelParameters : TravelParameters) : Promise<AxiosResponse> {
    return await apiClient({
      url: `/pilots/${pilotId}/travel`,
      method: "PUT"
    });
  }

  async function randomExistingPlanet() : Promise<Planet> {
    const connection = getConnection("Test Connection");
    const planetsRepository = connection.getRepository(Planet);
    return sample(await planetsRepository.find({}))!;
  }

  async function randomExistingPilotWithShip() : Promise<Pilot> {
    const connection = getConnection("Test Connection");
    const pilotsRepository = connection.getRepository(Pilot);
    return sample(await pilotsRepository.find({
      where: {
        shipId: Not(IsNull())
      }
    }))!;
  }

  describe("Pre Conditions", () => {
    const pilotsThatNeverWereIds = randomList(uuid, 10);
    test.each(pilotsThatNeverWereIds)(
      "Pilot id parameter must reference an existing pilot, case %s", 
      async (pilotThatNeverWasId) => {
        const response = await travel(pilotThatNeverWasId, {
          destinationPlanetId: (await randomExistingPlanet()).id
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "PilotNotFound"));
      }
    );

    test("The referenced pilot must own a ship", async () => {
      const connection = getConnection("Test Connection");
      const pilotsRepository = connection.getRepository(Pilot);
      const shiplessPilots = await pilotsRepository.find({
        where: {
          shipId: IsNull()
        }
      });
      const planet = await randomExistingPlanet();

      const responses = await Promise.all(shiplessPilots
        .map(pilot => travel(pilot.id, { destinationPlanetId: planet.id })));

      responses.forEach(response => {
        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "PilotHasNoShip"));
      });
    });

    const planetsThatNeverWereIds = randomList(uuid, 10);
    test.each(planetsThatNeverWereIds)(
      "Destination planet id parameter must reference an existing planet, %s", 
      async (planetThatNeverWasId) => {
        const pilot = await randomExistingPilotWithShip();

        const response = await travel(pilot.id, {
          destinationPlanetId: planetThatNeverWasId
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "PlanetNotFound"));
      }
    );

    test("Origin and destination planet must be different", async () => {
      const connection = getConnection("Test Connection");
      const pilotsRepository = connection.getRepository(Pilot);
      const planet = await randomExistingPlanet();
      const pilotLocatedAtPlanet = await pilotsRepository.findOne({
        where: {
          shipId: Not(IsNull()),
          currentLocationId: planet.id
        }
      });
      const response = await travel(pilotLocatedAtPlanet!.id, {
        destinationPlanetId: planet.id
      });

      expect(response.status).toBe(422);
      const error = response.data.error;
      expect(checkHasValidationErrorEntryCode(error, "OriginAndDestinationAreEqual"));
    });

    test("The 'route' between the origin and destination planets must exist", async () => {
      //NOTE These travelling data and planet values are, in a certain sense,
      //hardcoded, which is not good but will do for now

      const connection = getConnection("Test Connection");
      const pilotsRepository = connection.getRepository(Pilot);
      const planetsRepository = connection.getRepository(Planet);
      const demeter = (await planetsRepository.findOne({
        name: "Demeter"
      }))!;
      const andvari = (await planetsRepository.findOne({
        name: "Andvari"
      }))!;
      const pilotWithShip = (await pilotsRepository.findOne({
        where: {
          shipId: Not(IsNull())
        }
      }))!;
      pilotWithShip.currentLocationId = demeter.id;
      await pilotsRepository.save(pilotWithShip);
      
      const response = await travel(pilotWithShip.id, {
        destinationPlanetId: andvari.id
      });

      expect(response.status).toBe(422);
      const error = response.data.error;
      expect(checkHasValidationErrorEntryCode(error, "TravelImpossible"));
    });


    test("There must be enough fuel in the ship", async () => {
      const connection = getConnection("Test Connection");
      const pilotsRepository = connection.getRepository(Pilot);
      const shipsRepository = connection.getRepository(Ship);
      const planetsRepository = connection.getRepository(Planet);
      const calas = (await planetsRepository.findOne({
        name: "Calas"
      }))!;
      const andvari = (await planetsRepository.findOne({
        name: "Andvari"
      }))!;
      const pilotWithShip = await pilotsRepository.findOne({
        where: {
          shipId: Not(IsNull())
        },
        relations: ["ship"]
      }); 

      const ship = pilotWithShip!.ship!;
      ship.fuelLevel = 0;
      pilotWithShip!.currentLocationId = calas.id;

      await shipsRepository.save(ship);
      await pilotsRepository.save(pilotWithShip!);

      const response = await travel(pilotWithShip!.id, {
        destinationPlanetId: andvari.id
      });

      expect(response.status).toBe(422);
      const error = response.data.error;
      expect(checkHasValidationErrorEntryCode(error, "NotEnoughFuel"));
    });
  });

  describe("Post Conditions", () => {
    test("Ship fuel level is updated, pilot current location is updated, eligible contracts are closed", async () => {
      // const connection = getConnection("Test Connection");
      // const pilotsRepository = connection.getRepository(Pilot);
      // const shipsRepository = connection.getRepository(Ship);
      // const planetsRepository = connection.getRepository(Planet);
      // const contractsRepository = connection.getRepository(Contract);
      // const calas = (await planetsRepository.findOne({
      //   name: "Calas"
      // }))!;
      // const andvari = (await planetsRepository.findOne({
      //   name: "Andvari"
      // }))!;
      // const pilotWithShip = await pilotsRepository.findOne({
      //   where: {
      //     shipId: Not(IsNull())
      //   },
      //   relations: ["ship"]
      // });

      // const ship = pilotWithShip!.ship!;
      // ship.fuelLevel = 100000000;
      // pilotWithShip!.currentLocationId = calas.id;

      // await shipsRepository.save(ship);
      // await pilotsRepository.save(pilotWithShip!);

      // const response = await travel(pilotWithShip!.id, {
      //   destinationPlanetId: andvari.id
      // });

      // expect(response.status).toBe(200);

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