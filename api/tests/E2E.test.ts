import Big from "big.js";
import { sample, sampleSize, zip, random as randomNumber, isEqual, sortBy } from "lodash";
import { Contract } from "../src/entities/Contract";
import { Pilot } from "../src/entities/Pilot";
import { Planet } from "../src/entities/Planet";
import { Resource } from "../src/entities/Resource";
import { Ship } from "../src/entities/Ship";
import { ContractCreationData } from "../src/services/ContractsService";
import { PilotsService } from "../src/services/PilotsService";
import { PilotsResourcesSummary, PlanetsResourcesSummary, TransactionsLedger } from "../src/services/ReportsService";
import { clearDb, close, connection } from "./testHelpers/db";
import { acceptContract, createContract, createPilot, createResource, createShip, getContracts, getPlanets, pilotsResourcesSummary, planetsResourcesSummary, refuel, transactionsLedger, travel } from "./testHelpers/endpoints";
import { randomContractCreationData, randomList, randomPilotCreationData, randomResourceCreationData, randomShipCreationData } from "./testHelpers/random";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  // await clearDb();
  await close();
});

test("Full application flow", async () => {
  /***********************************************/
  /***********************************************/
  /* 1. Add pilots and their ships to the system */
  /***********************************************/
  /***********************************************/

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

  /***********************************/
  /***********************************/
  /* 2. Publish transport contracts */
  /***********************************/
  /***********************************/

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

  /*****************************/
  /*****************************/
  /* 3. Travel between planets */
  /*             AND           */
  /* 7. Register a refuel      */
  /*****************************/
  /*****************************/

  // Before we start with this functionality
  // it is important to keep in mind that
  // both planets and travelling data are
  // currently fixed and inserted into the DB
  // at the application's bootstrap.

  // With this out of the way, let's see
  // the travel possibilities/costs.

  /**
   * ---------------------------------------------
   * | From    | Andvari | Demeter | Aqua | Calas |
   * ----------------------------------------------
   * | Andvari |    -    |    X    |  13  |  23   |
   * ----------------------------------------------
   * | Demeter |    X    |    -    |  22  |  25   |
   * ----------------------------------------------
   * | Aqua    |    X    |   30    |   -  |  12   |
   * ----------------------------------------------
   * | Calas   |    20   |   25    |  15  |   -   |
   * ---------------------------------------------
   */

  // To make things easier on ourselves
  // (and avoid path finding with graphs)
  // let's create a representation of this table.
  // (This table is also represented within the DB)

  const travelTable = {
    Andvari: {
      Aqua: 13,
      Calas: 23
    },
    Demeter: {
      Aqua: 22,
      Calas: 25
    },
    Aqua: {
      Demeter: 30,
      Calas: 12
    },
    Calas: {
      Andvari: 20,
      Demeter: 25,
      Aqua: 15
    }
  };

  // Now we'll randomly choose somewhere for
  // our pilot to travel, based on the possibilities
  // from where he currently is.

  const pilotCurrentPlanetName = createdPilot.currentLocation.name;
  const possibleDestinations = Object.keys(travelTable[pilotCurrentPlanetName as keyof typeof travelTable]);
  const chosenDestination = sample(possibleDestinations)!;
  const chosenDestinationId = existingPlanets.find(planet => planet.name === chosenDestination)!.id;

  // Also as our ship was randomly generated, there's
  // the possibility that it doesn't have suficient 
  // fuel to do the trip.
  // Therefore we'll refuel with a random (but greater than 100 units)
  // amount to make sure that whatever the current fuel
  // level is, we'll be able to travel.

  // Oh, and don't worry about the pilot's credits
  // as our randomly generated pilot already starts with
  // at least 100000 credits.

  // The baseline fuel capacity is really high as well.
  // (For test subjects)

  const refuelAmount = randomNumber(100, 10000);
  const refuelResponse = await refuel(createdPilot.id, {
    amount: refuelAmount
  });

  const refueledPilot = refuelResponse.data as Pilot;

  // The refuel endpoint conveniently returns the
  // updated pilot object, so we can inspect 
  // the refuel actually had the expected outcome.
  const creditsSpent = Big(refuelAmount).times(PilotsService.refuelCostPerUnit);
  const remainingCredits = Big(createdPilot.credits).sub(creditsSpent);
  expect(refueledPilot.credits).toBe(remainingCredits.toString());

  const newFuelLevel = createdPilot.ship!.fuelLevel + refuelAmount;
  expect(refueledPilot.ship!.fuelLevel).toBe(newFuelLevel);

  // Time to travel!
  const travelResponse = await travel(createdPilot.id, {
    destinationPlanetId: chosenDestinationId
  });
  const updatedPilot = travelResponse.data as Pilot;

  const fromPilotCurrentPlanetTravelCosts = travelTable[pilotCurrentPlanetName as keyof typeof travelTable];
  const travelFuelCost = fromPilotCurrentPlanetTravelCosts[chosenDestination as keyof typeof fromPilotCurrentPlanetTravelCosts];
  const fuelLevelAfterTravel = newFuelLevel - travelFuelCost;

  expect(updatedPilot.currentLocation.name).toBe(chosenDestination);
  expect(updatedPilot.ship!.fuelLevel).toBe(fuelLevelAfterTravel);

  /**************************/
  /**************************/
  /* 4. List open contracts */
  /**************************/
  /**************************/

  // There are four possible status to
  // use to query contracts: 
  // - Any -> All contracts
  // - Open -> Open contracts
  // - Fulfilled -> Closed/fulfilled contracts
  // - In Effect -> Contracts accepted by pilots but not yet fulfilled

  // Currently in this test no contrats have been
  // either accepted, therefore they are all open.
  const fetchedContractsResponse = await getContracts({
    status: "Open"
  });
  const fetchedContracts = fetchedContractsResponse.data as Array<Contract>;
  
  // Now we must match the contracts we registered with the contracts
  // we fetched.
  fetchedContracts.map(fetchedContract => {
    const correspondingContract = createdContracts
      .find(createdContract => createdContract.id === fetchedContract.id);

    expect(correspondingContract).toEqual(correspondingContract);
  });

  /*********************************/
  /*********************************/
  /* 5. Accept transport contracts */
  /*********************************/
  /*********************************/

  // To accept a transport contract the pilot 
  // must be in the contract's origin planet
  // and also he/she must have enough
  // available weight capacity to
  // hold the contract's payload.

  // As contracts and players are randomly
  // generated, to make sure we'll have
  // a contract that can be instantly 
  // accepted (i.e. requires no beforehand travelling
  // to get to the origin planet) we'll 
  // created a contract tailored to the
  // pilot's current location.

  const resourcesForContractToBeAcceptedCreationData = 
    randomList(randomResourceCreationData, 5);
  const resourcesForContractToBeAcceptedResponses = await Promise.all(
    resourcesForContractToBeAcceptedCreationData.map(resource => createResource(resource))
  );
  const resourcesForContractToBeAccepted = resourcesForContractToBeAcceptedResponses
    .map(response => response.data  as Resource);

  const possibleContractDestinations = Object.keys(travelTable[updatedPilot.currentLocation.name as keyof typeof travelTable]);
  const contractDestination = sample(possibleContractDestinations)!;
  const contractDestinationId = existingPlanets.find(planet => planet.name === contractDestination)!.id;
  const contractToBeAcceptedCreationData : ContractCreationData = {
    ...randomContractCreationData(
      updatedPilot.currentLocationId,
      contractDestinationId,
      resourcesForContractToBeAccepted.map(resource => resource.id)
    )
  };

  const contractToBeAccepted = (await createContract(contractToBeAcceptedCreationData)).data as Contract;
  
  // Now that we have our contract, let's accept it!
  const acceptedContractResponse = await acceptContract(updatedPilot.id, {
    contractId: contractToBeAccepted.id
  });
  
  // This endpoint returns the accepted contract
  // with both the pilot and ship entities embbeded.

  const acceptedContract = acceptedContractResponse.data as Contract;
  const acceptedContractPilot = acceptedContract.contractee!;
  const acceptedContractShip = acceptedContract.contractee!.ship!;
  const fueledShipWeight = updatedPilot.ship!.currentWeight;
  const acceptedContractShipWeight = acceptedContractShip.currentWeight;
  const acceptedContractPayloadWeight = acceptedContract.payload
    .reduce((accum, entry) => accum + entry.weight, 0);
  
  expect(acceptedContract.contractee!.name).toBe(updatedPilot.name);
  expect(fueledShipWeight + acceptedContractPayloadWeight).toBe(acceptedContractShipWeight);

  /***************************************************************/
  /***************************************************************/
  /* 6. Grant credits to the pilot after fulfilling the contract */
  /***************************************************************/
  /***************************************************************/

  // Now we can make the pilot travel to the accepted contract
  // destination and then collect his reward!

  // As made sure that the contract's destination was only
  // a travel away form the origin we only need a single trip.
  const contractFulfillmentTravelResponse = await travel(acceptedContractPilot.id, {
    destinationPlanetId: contractDestinationId
  });

  const fulfilledContractPilot = contractFulfillmentTravelResponse.data as Pilot;
  const fulfilledContractShip = fulfilledContractPilot.ship!;

  // We need to make sure that the pilot received 
  // the credits, and the payload was offloaded
  // from the ship.

  const acceptedContractValue = Big(acceptedContract.value);
  const acceptedContractPilotCredits = Big(acceptedContractPilot.credits);
  const fulfilledContractPilotCredits = Big(fulfilledContractPilot.credits);
  expect(acceptedContractPilotCredits.add(acceptedContractValue).toString()).toBe(fulfilledContractPilotCredits.toString());

  expect(fueledShipWeight).toBe(fulfilledContractShip.currentWeight);

  /**************/
  /**************/
  /* 8. Reports */
  /**************/
  /**************/

  // Planets Resources Summary
  // Transfered resources stems from the
  // fulfilled contract
  const fulfilledContractResources = acceptedContract.payload;
  const fulfilledContractOrigin = acceptedContract.originPlanet!.name;
  const fulfilledContractDestination = acceptedContract.destinationPlanet!.name;
  const fulfilledContractFormattedResources : Record<string, string> = {};
  for(const resource of fulfilledContractResources) {
    fulfilledContractFormattedResources[resource.name] = resource.weight.toString();
  }
  
  const planetsResourcesSummaryData = (await planetsResourcesSummary()).data as PlanetsResourcesSummary;

  expect(planetsResourcesSummaryData.some(entry => {
    isEqual(entry, {
      planet: fulfilledContractOrigin,
      sent: fulfilledContractFormattedResources
    });
  }));

  expect(planetsResourcesSummaryData.some(entry => {
    isEqual(entry, {
      planet: fulfilledContractDestination,
      received: fulfilledContractFormattedResources
    });
  }));

  // Pilots Resources Summary
  // Transfered resources stems from the
  // fulfilled contract
  const pilotsResourcesSummaryData = (await pilotsResourcesSummary()).data as PilotsResourcesSummary;

  expect(pilotsResourcesSummaryData.some(entry => {
    entry.pilot === createdPilot.name &&
    isEqual(sortBy(entry.resources), fulfilledContractResources.map(e => ({
      name: e.name,
      weight: e.weight
    })));
  }));

  // Transactions Ledger
  // Both our fulfilled contract and refuel
  // must be registered in the transactions ledger.
  const transactionsLedgerData = (await transactionsLedger()).data as TransactionsLedger;
  expect(transactionsLedgerData.some(entry => {
    return isEqual(entry, {
      description: `${createdPilot.name} bought fuel`,
      value: creditsSpent.toString()
    });
  }));

  expect(transactionsLedgerData.some(entry => {
    return isEqual(entry, {
      description: `Contract ${acceptedContract.id}, ${acceptedContract.description}`,
      value: `-${creditsSpent.toString()}`
    });
  }));
  console.log(transactionsLedgerData);
});