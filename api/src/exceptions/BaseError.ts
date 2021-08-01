export class BaseError {
  constructor(message : string, type : string, code : string) {
    this.message = message;
    this.type = type;
    this.code = code;
  }

  public message : string;
  public type : string;
  public code : string;
}