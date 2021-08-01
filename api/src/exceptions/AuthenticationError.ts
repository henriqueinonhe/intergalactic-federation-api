import { BaseError } from "./BaseError";

export class AuthenticationError extends BaseError {
  constructor(message : string, code : string) {
    super(message, "AuthenticationError", code);
  }
}