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

export type Project = {
  id: string;
  companyId: string;
  projectStatusId: string;
  projectCode: string;
  name: string;
  clientId: string | null;
  location: string | null;
  contractAmount: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
};

export type ProjectStatus = {
  id: string;
  name: string;
  isActive?: boolean;
};

export type Party = {
  id: string;
  companyId: string;
  partyTypeId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  panNo: string | null;
  isActive: boolean;
};

export type PartyType = {
  id: string;
  name: string;
  isActive?: boolean;
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
