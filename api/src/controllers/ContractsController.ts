import { wrapAsyncController } from "../helpers/wrapController";
import { ContractsService } from "../services/ContractsService";

export class ContractsController {
  public static createContract = wrapAsyncController(async (req, res, next) => {
    const contractCreationData = req.body;

    const createdContract = await ContractsService.createContract(contractCreationData);

    res.send(201).send(createdContract);
    next();
  });

  public static getContracts = wrapAsyncController(async (req, res, next) => {
    const query = req.query;

    const contracts = await ContractsService.getContracts(query);
    
    res.send(contracts);
    next();
  });
}