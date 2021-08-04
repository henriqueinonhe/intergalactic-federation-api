import { ValidationError } from "../../src/exceptions/ValidationError";

export function checkHasValidationErrorEntryCode(error : ValidationError, code : string) : boolean {
  return error.entries.some(entry => entry.code === code);
}