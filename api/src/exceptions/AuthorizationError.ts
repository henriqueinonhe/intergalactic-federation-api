import { BaseError } from "./BaseError";

export class AuthorizationError extends BaseError {
  constructor(message : string, code : string) {
    super(message, "AuthorizationError", code);
  }
}