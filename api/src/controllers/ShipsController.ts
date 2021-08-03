import { wrapAsyncController } from "../helpers/wrapController";

export class ShipsController {
  public static createShip = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });
}