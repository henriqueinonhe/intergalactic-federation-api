import { AxiosResponse } from "axios";
import { sample, sampleSize, random as randomNumber } from "lodash";
import RandExp from "randexp";
import { DeepPartial, getConnection, getRepository, IsNull, Not } from "typeorm";
import { Contract } from "../src/entities/Contract";
import { Planet } from "../src/entities/Planet";
import { Resource } from "../src/entities/Resource";
import { ContractCreationData, ContractStatus, GetContractsQuery } from "../src/services/ContractsService";
import { apiClient } from "./testHelpers/apiClient";
import { clearDb, connection, populateDb, close } from "./testHelpers/db";
import { randomContractCreationData, randomList } from "./testHelpers/random";
import { checkHasValidationErrorEntryCode } from "./testHelpers/validationErrors";
import { v4 as uuid } from "uuid";

beforeAll(async () => {
  await connection();
});

afterAll(async () => {
  await close();
});

describe("Get Contracts", () => {
  beforeAll(async () => {
    await populateDb();
  });
  
  afterAll(async () => {
    await clearDb();
  });

  const getContracts = async (query ?: GetContractsQuery) : Promise<AxiosResponse> => {
    return await apiClient.request({
      url: "/contracts",
      method: "GET",
      params: query
    });
  };

  describe("Pre Conditions", () => {
    const invalidStatuses = randomList(() => new RandExp(/\w{1,10}/).gen(), 40);

    test.each(invalidStatuses)(
      "Contract status must be one of the possible statuses, case %s", 
      async (invalidStatus) => {
        const response = await getContracts({
          status: invalidStatus as ContractStatus
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidContractCreationDataStatus")).toBe(true);
      }
    );
  });

  describe("Post Conditions", () => {
    function formatContracts(contracts : Array<Contract>) : Array<DeepPartial<Contract>> {
      return contracts.map(contract => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          createdAt,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          updatedAt,
          ...contractWithNoTimestamps
        } = contract;

        return {
          ...contractWithNoTimestamps,
          value: contract.value.toJSON()
        };
      });
    }

    function formatFetchedContracts(contracts : Array<any>) : Array<any> {
      return contracts.map(contract => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          createdAt,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          updatedAt,
          ...contractWithNoTimestamps
        } = contract;

        return contractWithNoTimestamps;
      });
    }

    test("Fetching all contracts", async () => {
      const connection = getConnection("Test Connection");
      const contractsRepository = connection.getRepository(Contract);
      const contracts = formatContracts(await contractsRepository.find({}));

      const response = await getContracts({ status: "Any" });
      expect(response.status).toBe(200);

      const fetchedContracts = formatFetchedContracts(response.data);

      fetchedContracts.forEach(fetchedContract => {
        expect(contracts.find(e => e.id === fetchedContract.id)).toEqual(fetchedContract);
      });
    });

    test("Fetching open contracts", async () => {
      const connection = getConnection("Test Connection");
      const contractsRepository = connection.getRepository(Contract);
      const contracts = formatContracts(await contractsRepository.find({
        where: {
          contracteeId: IsNull()
        }
      }));

      const response = await getContracts({ status: "Open" });
      expect(response.status).toBe(200);

      const fetchedContracts = formatFetchedContracts(response.data);

      fetchedContracts.forEach(fetchedContract => {
        expect(contracts.find(e => e.id === fetchedContract.id)).toEqual(fetchedContract);
      });
    });

    test("Fetchig contracts in effect", async () => {
      const connection = getConnection("Test Connection");
      const contractsRepository = connection.getRepository(Contract);
      const contracts = formatContracts(await contractsRepository.find({
        where: {
          contracteeId: Not(IsNull()),
          fulfilledAt: IsNull()
        }
      }));

      const response = await getContracts({ status: "In Effect" });
      expect(response.status).toBe(200);

      const fetchedContracts = formatFetchedContracts(response.data);

      fetchedContracts.forEach(fetchedContract => {
        expect(contracts.find(e => e.id === fetchedContract.id)).toEqual(fetchedContract);
      });
    });

    test("Fetching fulfilled contracts", async () => {
      const connection = getConnection("Test Connection");
      const contractsRepository = connection.getRepository(Contract);
      const contracts = formatContracts(await contractsRepository.find({
        where: {
          fulfilledAt: Not(IsNull())
        }
      }));

      const response = await getContracts({ status: "Fulfilled" });
      expect(response.status).toBe(200);

      const fetchedContracts = formatFetchedContracts(response.data);

      fetchedContracts.forEach(fetchedContract => {
        expect(contracts.find(e => e.id === fetchedContract.id)).toEqual(fetchedContract);
      });
    });
  });
});

describe("Create Contract", () => {

  beforeAll(async () => {
    await populateDb();
  });
  
  afterAll(async () => {
    await clearDb();
  });

  const createContract = async (contractCreationData : ContractCreationData) : Promise<AxiosResponse> => {
    return await apiClient.request({
      url: "/contracts",
      method: "POST",
      data: contractCreationData
    });
  };

  async function randomContractCreationDataWithDefaults() : Promise<ContractCreationData> {
    const connection = getConnection("Test Connection");
    const planetsRepository = connection.getRepository(Planet);
    const resourcesRepository = connection.getRepository(Resource);

    const existingPlanets = await planetsRepository.find({});
    const existingAvailableResources = await resourcesRepository.find({
      where: {
        contractId: IsNull()
      }
    });

    const originPlanetId = sample(existingPlanets)!.id;
    const eligibleDestinationPlanets = existingPlanets.filter(planet => planet.id !== originPlanetId);
    const destinationPlanetId = sample(eligibleDestinationPlanets)!.id;
    const payloadIds = sampleSize(existingAvailableResources, randomNumber(1, 10)).map(e => e.id);

    return randomContractCreationData(originPlanetId, destinationPlanetId, payloadIds);
  }

  describe("Pre Conditions", () => {
    const invalidDescriptions = [
      "",
      0,
      234234,
      null,
      {},
      []
    ];
    test.each(invalidDescriptions)(
      "Contract description must be a non empty string, case %s", 
      async (invalidDescription) => {
        const response = await createContract({
          ...await randomContractCreationDataWithDefaults(),
          description: invalidDescription as any
        });

        expect(response.status).toBe(422);
        const error = response.data.error;
        expect(checkHasValidationErrorEntryCode(error, "InvalidContractCreationDataDescription")).toBe(true);
      }
    );

    const invalidPayloadIds = [
      "",
      "asdasd",
      0,
      234234,
      {},
      [],
      [1, 4, 2],
      [1, "adsasd"]
    ];
    test.each(invalidPayloadIds)(
      "Payloads ids must be a non empty string array, case %s", 
      async (invalidPayloadId) => {

        const response = await createContract({
          ...await randomContractCreationDataWithDefaults(),
          payloadIds: invalidPayloadId as any
        });

        expect(response.status).toBe(422);
        // const error = response.data.error;
        // expect(checkHasValidationErrorEntryCode(error, "InvalidContractCreationDataPayloadIds")).toBe(true);
      }
    );

    test("Payloads ids must reference existing resources", async () => {
      const nonExistingPayloadsIds = randomList(uuid, 5);
      const contractCreationData = await randomContractCreationDataWithDefaults();

      const response = await createContract({
        ...contractCreationData,
        payloadIds: [...contractCreationData.payloadIds, ...nonExistingPayloadsIds]
      });

      expect(response.status).toBe(422);
      const error = response.data.error;
      expect(checkHasValidationErrorEntryCode(error, "ResourceNotFound")).toBe(true);
    });

    test("Payloads ids must reference resources that are not attached to any contract", async () => {
      const connection = getConnection("Test Connection");
      const resourcesRepository = connection.getRepository(Resource);
      const resourcesAlreadyOwnedBySomeContract = await resourcesRepository.find({
        where: {
          contractId: Not(IsNull())
        }
      });

      const contractCreationData = await randomContractCreationDataWithDefaults();
      const payloadIds = resourcesAlreadyOwnedBySomeContract.map(e => e.id);
      const response = await createContract({
        ...contractCreationData,
        payloadIds: [...contractCreationData.payloadIds, ...payloadIds]
      });

      expect(response.status).toBe(422);
      const error = response.data.error;
      expect(checkHasValidationErrorEntryCode(error, "ResourceAlreadyAssociatedWithContract")).toBe(true);
    });

    const invalidOriginPlanetIds = [
      "",
      "asdasd",
      0,
      234234,
      {},
      [],
      [1, 4, 2],
      [1, "adsasd"]
    ];
    test.each(invalidOriginPlanetIds)(
      "Origin planet id must be a non empty string, case %s", 
      async (invalidOriginPlanetId) => {
        const response = await createContract({
          ...await randomContractCreationDataWithDefaults(),
          originPlanetId: invalidOriginPlanetId as any
        });

        expect(response.status).toBe(422);
      }
    );

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