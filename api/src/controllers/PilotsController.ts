import { wrapAsyncController } from "../helpers/wrapController";

export class PilotsController {
  public static createPilot = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });

  public static travel = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });

  public static refuel = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });

  public static acceptContract = wrapAsyncController(async (req, res, next) => {
    //TODO
    res.send({ message: "Ok" });
    next();
  });
}