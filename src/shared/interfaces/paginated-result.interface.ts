export interface PaginatedResult<T> {
    records: T[];
    count: Number;
}