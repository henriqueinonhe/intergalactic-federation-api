import { BaseError } from "./BaseError";

export class ValidationError extends BaseError {
  constructor(message : string, code : string, entries : Array<ValidationErrorEntry> = []) {
    super(message, "ValidationError", code);
    
    this.entries = entries;
  }

  public addEntry(entry : ValidationErrorEntry) : void {
    this.entries = [...this.entries, entry];
  }

  public hasErrors() : boolean {
    return this.entries.length !== 0;
  }

  public entries : Array<ValidationErrorEntry>;
}

export interface ValidationErrorEntry {
  message : string;
  code : string;
}