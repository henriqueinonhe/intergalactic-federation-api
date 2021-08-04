import { clearDb, connection, populateDb, close } from "./testHelpers/db";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  await close();
});

describe("Create Ship", () => {
  
  // afterAll(async () => {
  //   await clearDb();
  // });

  describe("Pre Conditions", () => {
    test("Fuel capacity must be a positive integer", async () => {
      //TODO
      await populateDb();
    });

    test("Fuel level must be a zero or positive integer and less than fuel capacity", async () => {
      //TODO
    });

    test("Weight capacity must be a positive integer", async () => {
      //TODO
    });

    test("Current weight must be a zero or positive integer and less than weight capacity", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Ship is successfully created", async () => {
      //TODO
    });
  });
});