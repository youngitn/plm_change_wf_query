export interface IOption {
  label: string;
  value: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
}
