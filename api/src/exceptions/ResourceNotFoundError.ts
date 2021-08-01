import { BaseError } from "./BaseError";

export class ResourceNotFoundError extends BaseError {
  constructor(message : string, code : string) {
    super(message, "ResourceNotFoundError", code);
  }

}