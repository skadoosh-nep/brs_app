export type SessionToken = { accessToken: string; tokenType: string };

export type Company = {
  id: string;
  name: string;
  address: string | null;
  panNo: string;
  phone: string;
  email: string;
};

export type FiscalYear = {
  id: string;
  companyId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type Page<T> = {
  items: T[];
  total?: number;
  page: number;
  pageSize: number;
};

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: FieldErrors = {},
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
