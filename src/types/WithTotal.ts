export type WithTotal<T> = {
    total: number;
    data: T[];
}