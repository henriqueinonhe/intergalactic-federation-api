import { ValueTransformer } from "typeorm";
import Big, { Big as BigType } from "big.js";

export const decimalTransformer : ValueTransformer = {
  from: dbValue => dbValue ? Big(dbValue) : dbValue,
  to: (entityValue : BigType) => entityValue ? entityValue.toString() : entityValue
};