import { wrapAsyncController } from "../helpers/wrapController";
import { PlanetsService } from "../services/PlanetsService";

export class PlanetsController {
  public static getPlanets = wrapAsyncController(async (req, res, next) => {
    const planets = await PlanetsService.getPlanets();

    res.status(200).send(planets);
    next();
  });
}