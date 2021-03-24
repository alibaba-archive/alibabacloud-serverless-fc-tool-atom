export interface PaginationOptions {
  pageNumber?: number;
  pageSize?: number;
}

export type Dict<R = unknown> = { [key: string]: R };
