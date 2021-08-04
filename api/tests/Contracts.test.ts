import { clearDb } from "./testHelpers/db";

afterAll(async () => {
  clearDb();
});

describe("Get Contracts", () => {
  describe("Pre Conditions", () => {
    test("Contract status must be one of the possible statuses", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Fetching all contracts", async () => {
      //TODO
    });

    test("Fetching open contracts", async () => {
      //TODO
    });

    test("Fetchig contracts in effect", async () => {
      //TODO
    });

    test("Fetching fulfilled contracts", async () => {
      //TODO
    });
  });
});

describe("Create Contract", () => {
  describe("Pre Conditions", () => {
    test("Contract description must be a non empty string", async () => {
      //TODO
    });

    test("Payloads ids must be a non empty string array", async () => {
      //TODO
    });

    test("Payloads ids must reference existing resources", async () => {
      //TODO
    });

    test("Payloads ids must reference resources that are not attached to any contract", async () => {
      //TODO
    });

    test("Origin planet id must be a non empty string", async () => {
      //TODO
    });

    test("Origin planet id must reference an existing planet", async () => {
      //TODO
    });

    test("Destination planet id must be a non empty string", async () => {
      //TODO
    });

    test("Destination planet id must reference an existing planet", async () => {
      //TODO
    });

    test("Value must be a decimal", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Contract is properly created", async () => {
      //TODO
    });
  });
});