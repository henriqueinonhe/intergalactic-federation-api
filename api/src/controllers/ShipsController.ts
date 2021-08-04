import { wrapAsyncController } from "../helpers/wrapController";
import { ShipsService } from "../services/ShipsService";

export class ShipsController {
  public static createShip = wrapAsyncController(async (req, res, next) => {
    const shipCreationData = req.body;
    const createdShip = await ShipsService.createShip(shipCreationData);

    res.status(201).send(createdShip);
    next();
  });
}