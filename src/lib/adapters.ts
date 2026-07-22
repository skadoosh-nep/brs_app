import type { Company, FiscalYear, Page, SessionToken } from "@/types/domain";

type JsonObject = Record<string, unknown>;

function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label} response`);
  }
  return value as JsonObject;
}

function payload(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  const root = object(value, "API");
  return root.data ?? root;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing ${field}`);
  return value;
}

export function sessionAdapter(value: unknown): SessionToken {
  const data = object(payload(value), "session");
  return {
    accessToken: requiredString(data.access_token, "access_token"),
    tokenType: typeof data.token_type === "string" ? data.token_type : "Bearer",
  };
}

export function companyAdapter(value: unknown): Company {
  const data = object(payload(value), "company");
  return {
    id: requiredString(data.id, "company.id"),
    name: requiredString(data.name, "company.name"),
    address: typeof data.address === "string" ? data.address : null,
    panNo: requiredString(data.pan_no, "company.pan_no"),
    phone: requiredString(data.phone, "company.phone"),
    email: requiredString(data.email, "company.email"),
  };
}

export function fiscalYearAdapter(value: unknown): FiscalYear {
  const data = object(payload(value), "fiscal year");
  return {
    id: requiredString(data.id, "fiscal_year.id"),
    companyId: requiredString(data.company_id, "fiscal_year.company_id"),
    name: requiredString(data.name, "fiscal_year.name"),
    startDate: requiredString(data.start_date, "fiscal_year.start_date"),
    endDate: requiredString(data.end_date, "fiscal_year.end_date"),
    isActive: data.is_active === true,
  };
}

export function fiscalYearsAdapter(value: unknown, page = 1, pageSize = 20): Page<FiscalYear> {
  const root = payload(value);
  const envelope = Array.isArray(root) ? null : object(root, "fiscal years");
  const items = Array.isArray(root) ? root : envelope?.items;
  if (!Array.isArray(items)) throw new Error("Invalid fiscal year collection response");
  return {
    items: items.map((item) => fiscalYearAdapter(item)),
    total: typeof envelope?.total === "number" ? envelope.total : undefined,
    page: typeof envelope?.page === "number" ? envelope.page : page,
    pageSize: typeof envelope?.page_size === "number" ? envelope.page_size : pageSize,
  };
}
