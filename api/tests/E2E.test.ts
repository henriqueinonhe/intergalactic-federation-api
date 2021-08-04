import { sample, sampleSize, zip, random as randomNumber } from "lodash";
import { Contract } from "../src/entities/Contract";
import { Pilot } from "../src/entities/Pilot";
import { Planet } from "../src/entities/Planet";
import { Ship } from "../src/entities/Ship";
import { PilotCreationData } from "../src/services/PilotsService";
import { ShipCreationData } from "../src/services/ShipsService";
import { clearDb, close, connection } from "./testHelpers/db";
import { createContract, createPilot, createResource, createShip, getPlanets } from "./testHelpers/endpoints";
import { randomContractCreationData, randomList, randomPilotCreationData, randomResourceCreationData, randomShipCreationData } from "./testHelpers/random";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  await clearDb();
  await close();
});

test("Full application flow", async () => {
  /* 1. Add pilots and their ships to the system */

  // First we need to come up with a ship.
  // It doesn't really matter the parameters
  // we're going to use so long they are within
  // valid constraints.

  // We're creating a ship with random data,
  // but of course we're making sure that
  // weight and fuel are positive numbers,
  // currentWeight is less than weightCapacity
  // and so on.
  const shipCreationData = randomShipCreationData();
  console.log(shipCreationData);

  // Then we call the ship creation endpoint,
  // which upon completion, conveniently
  // returns the created ship instance.
  const createdShip = (await createShip(shipCreationData)).data as Ship;
  console.log(createdShip);
  
  // Now we check that the created ship data
  // actually reflects the data we sent.
  expect(createdShip).toMatchObject(shipCreationData);

  // Next, we create a pilot that will drive this ship
  // we just created.

  // Once again it doesn't really matter the specific
  // parameter we'll use to create our pilot, 
  // however in this case it is worth to explore
  // some cases where the pilot creation fails.

  // To do so we first start with a randomly (but valid) assembled
  // pilot creation data.

  // A pilot need a planet to be located at.
  // (doesn't really matter which).
  const existingPlanets = (await getPlanets()).data as Array<Planet>;
  const pilotInitialPlanet = sample(existingPlanets)!;

  const pilotCreationData = randomPilotCreationData(
    pilotInitialPlanet.id, 
    createdShip.id
  );
  console.log(pilotCreationData);

  // Now we can call the create pilot endpoint
  // which also conveniently returns the created
  // pilot instance.
  const createdPilot = (await createPilot(pilotCreationData)).data as Pilot;
  console.log(createdPilot);
  
  // Checking the created pilot reflects the sent data.
  expect(createdPilot).toMatchObject(pilotCreationData);

  // Here we have both our pilot and his ship
  // registered in the system!


  /* 2. Publish transport contracts */

  // Before publishing a contract we first need
  // to register the resources that will serve
  // as the contract's payload.

  // As you probably guessed we'll be using randomly
  // generated data to create these resources.
  // And we'll do this in bulk!

  const resourceCreationData = randomList(randomResourceCreationData, 300);
  const createResourcesResponses = await Promise.all(resourceCreationData
    .map(data => createResource(data)));
  const createdResources = createResourcesResponses.map(response => response.data);

  // Checking created resources reflect sent data
  zip(createdResources, resourceCreationData).forEach(([createdResource, resourceCreationData]) => {
    expect(createdResource).toMatchObject(resourceCreationData!);
  });

  // Then we'll publish contracts, and we'll
  // assign origin planets, destination planets
  // and resources to them randomly.
  
  // To keep track of unassigned resources.
  const availableResources = createdResources.slice();
  const contractsCreationData = randomList(() => {
    const originPlanet = sample(existingPlanets)!;
    //Origin and destination planets must differ
    const suitableDestinationPlanets = existingPlanets
      .filter(planet => planet.id !== originPlanet.id);
    const destinationPlanet = sample(suitableDestinationPlanets)!;
    const assignedResources = sampleSize(availableResources, randomNumber(1, 5));
    const payloadIds = assignedResources.map(resource => resource.id);

    // Not the most performant way to do this,
    // but in this case convenience beats performance.
    assignedResources.forEach(assignedResource => {
      const assignedResourceIndex = availableResources
        .findIndex(availableResources => assignedResource.id === availableResources.id);
      availableResources.splice(assignedResourceIndex, 1);
    });
    
    return randomContractCreationData(
      originPlanet.id, 
      destinationPlanet.id,
      payloadIds
    );
  }, 40);

  // Calling create contract endpoint
  const createContractResponses = await Promise.all(contractsCreationData
    .map(contractCreationData => createContract(contractCreationData)));
  const createdContracts = createContractResponses.map(response => response.data) as Array<Contract>;

  // Checking created contracts data
  zip(createdContracts, contractsCreationData).forEach(([createdContract, contractCreationData]) => {
    // Payloads must be compared separately
    // as they come in a different "format"
    // and might be in a different order.

    const {
      payloadIds,
      ...contractCreationDataWithoutPayload 
    } = contractCreationData!;

    expect(createdContract).toMatchObject(contractCreationDataWithoutPayload);

    const createdContractPayloadIds = createdContract!.payload.map(resource => resource.id);
    payloadIds.forEach(payloadId => {
      expect(createdContractPayloadIds).toContain(payloadId);
    });
  });
});