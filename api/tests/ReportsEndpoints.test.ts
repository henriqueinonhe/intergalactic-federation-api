import { connection, close } from "./testHelpers/db";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  await close();
});
describe("Planets Resources Summary", () => {
  describe("Pre Conditions", () => {
    //None
  });

  describe("Post Conditions", () => {
    test("Report is correct", async () => {
      //TODO
    });
  });
});

describe("Pilots Resources Summary", () => {
  describe("Pre Conditions", () => {
    //None
  });

  describe("Post Conditions", () => {
    test("Report is correct", async () => {
      //TODO
    });
  });
});

describe("Transactions Ledger", () => {
  describe("Pre Conditions", () => {
    //None
  });

  describe("Post Conditions", () => {
    test("Report is correct", async () => {
      //TODO
    });
  });
});