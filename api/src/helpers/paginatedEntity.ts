export type PaginatedEntity<T> = {
  data : Array<T>;
  meta : {
    nextPageLink : string;
    previousPageLink : string;
  }
};