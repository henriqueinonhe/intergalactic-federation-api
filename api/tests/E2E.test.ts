import { ShipCreationData } from "../src/services/ShipsService";
import { clearDb, close, connection } from "./testHelpers/db";
import { createShip } from "./testHelpers/endpoints";
import { randomShipCreationData } from "./testHelpers/random";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  await clearDb();
  await close();
});

test("Full application flow", async () => {
  // 1. Add pilots and their ships to the system

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

  // Then we call the ship creation endpoint,
  // which upon completion, conveniently
  // returns the created ship instance.
  const response = await createShip(shipCreationData);
  const createdShip = response.data;
  
  // Now we check that the created ship data
  // actually reflects the data we sent.
  expect(createdShip).toMatchObject(shipCreationData);

  // Next, we create a pilot that will drive this ship
  // we just created.

  // Once again it doesn't really matter the specific
  // parameter we'll use to create our pilot, 
  // however in this case it is worth to explore
  // some cases where the pilot creation fails.

  // To do so we first start with a randomly VALID assembled
  // pilot creation data.
  // const pilotCreationData = 
});