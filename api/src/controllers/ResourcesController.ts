import { wrapAsyncController } from "../helpers/wrapController";
import { ResourcesService } from "../services/ResourcesService";

export class ResourcesController {
  public static createResource = wrapAsyncController(async (req, res, next) => {
    const resourceCreationData = req.body;
    const createdResource = await ResourcesService.createResource(resourceCreationData);

    res.status(201).send(createdResource);
    next();
  });
}