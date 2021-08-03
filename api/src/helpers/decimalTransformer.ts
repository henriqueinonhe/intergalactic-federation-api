import { ValueTransformer } from "typeorm";
import Big, { Big as BigType } from "big.js";

export const decimalTransformer : ValueTransformer = {
  from: dbValue => Big(dbValue),
  to: (entityValue : BigType) => entityValue.toString()
};