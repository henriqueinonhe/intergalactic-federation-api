import express from "express";
import { ContractsController } from "./controllers/ContractsController";
import { PilotsController } from "./controllers/PilotsController";
import { ReportsController } from "./controllers/ReportsController";
import { ShipsController } from "./controllers/ShipsController";

export const router = express.Router();

//Pilots
router.route("/pilots")
  .post(PilotsController.createPilot);

router.route("/pilots/:id/travel")
  .put(PilotsController.travel);

router.route("/pilots/:id/refuel")
  .put(PilotsController.refuel);

router.route("/pilots/:id/acceptContract")
  .put(PilotsController.acceptContract);

//Ships
router.route("/ships")
  .post(ShipsController.createShip);

//Contracts
router.route("/contracts")
  .post(ContractsController.createContract)
  .get(ContractsController.getContracts);

//Reports
router.route("/reports/planetsResourcesSummary")
  .get(ReportsController.planetsResourcesSummary);

router.route("/reports/pilotsResourcesSummary")
  .get(ReportsController.pilotsResourcesSummary);

router.route("/reports/transactionsLedger")
  .get(ReportsController.transactionsLedger);