import { clearDb } from "./testHelpers/db";

afterAll(async () => {
  clearDb();
});

describe("Create Ship", () => {
  describe("Pre Conditions", () => {
    test("Fuel capacity must be a positive integer", async () => {
      //TODO
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