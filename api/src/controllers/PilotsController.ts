import { wrapAsyncController } from "../helpers/wrapController";
import { PilotsService } from "../services/PilotsService";

export class PilotsController {
  public static createPilot = wrapAsyncController(async (req, res, next) => {
    const pilotCreationData = req.body;
    const createdPilot = await PilotsService.createPilot(pilotCreationData);

    res.status(201).send(createdPilot);
    next();
  });

  public static travel = wrapAsyncController(async (req, res, next) => {
    const pilotId = req.params.id;
    const travelParameters = req.body;

    const pilot = await PilotsService.travel(pilotId, travelParameters);
    
    res.send(200).send(pilot);
    next();
  });

  public static refuel = wrapAsyncController(async (req, res, next) => {
    const pilotId = req.params.id;
    const refuelParameters = req.body;

    const pilot = await PilotsService.refuel(pilotId, refuelParameters);
    
    res.send(200).send(pilot);
    next();
  });

  public static acceptContract = wrapAsyncController(async (req, res, next) => {
    const pilotId = req.params.id;
    const acceptContractParameters = req.body;

    const contract = await PilotsService.acceptContract(pilotId,
                                                        acceptContractParameters);

    res.send(200).send(contract);
    next();
  });
}