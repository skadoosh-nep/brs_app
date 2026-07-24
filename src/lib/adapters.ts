import type {
  AccountGroup,
  AccountGroupNode,
  AccountGroupType,
  Company,
  FiscalYear,
  Ledger,
  Page,
  Party,
  PartyType,
  Project,
  ProjectStatus,
  SessionToken,
} from "@/types/domain";

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

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function collection(
  value: unknown,
  label: string,
): { items: unknown[]; envelope: JsonObject | null; meta: JsonObject | null } {
  if (Array.isArray(value)) return { items: value, envelope: null, meta: null };
  const root = object(value, "API");
  const data = root.data ?? root;
  if (Array.isArray(data)) {
    return {
      items: data,
      envelope: null,
      meta: root.meta && typeof root.meta === "object" ? root.meta as JsonObject : null,
    };
  }
  const envelope = object(data, label);
  if (!Array.isArray(envelope.items)) throw new Error(`Invalid ${label} collection response`);
  const metaValue = root.meta ?? envelope.meta;
  return {
    items: envelope.items,
    envelope,
    meta: metaValue && typeof metaValue === "object" ? metaValue as JsonObject : null,
  };
}

function pagination(
  envelope: JsonObject | null,
  meta: JsonObject | null,
  fallbackPage: number,
  fallbackPageSize: number,
): Omit<Page<never>, "items"> {
  const nested = meta?.pagination && typeof meta.pagination === "object"
    ? meta.pagination as JsonObject
    : meta;
  const source = { ...(envelope ?? {}), ...(nested ?? {}) };
  const pageSizeValue = source.page_size ?? source.pageSize;
  return {
    total: typeof source.total === "number" ? source.total : undefined,
    page: typeof source.page === "number" ? source.page : fallbackPage,
    pageSize: typeof pageSizeValue === "number" ? pageSizeValue : fallbackPageSize,
  };
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

export function projectAdapter(value: unknown): Project {
  const data = object(payload(value), "project");
  const amount = data.contract_amount;
  if (typeof amount !== "string" && typeof amount !== "number") {
    throw new Error("Missing project.contract_amount");
  }
  return {
    id: requiredString(data.id, "project.id"),
    companyId: requiredString(data.company_id, "project.company_id"),
    projectStatusId: requiredString(data.project_status_id, "project.project_status_id"),
    projectCode: requiredString(data.project_code, "project.project_code"),
    name: requiredString(data.name, "project.name"),
    clientId: optionalString(data.client_id),
    location: optionalString(data.location),
    contractAmount: String(amount),
    startDate: optionalString(data.start_date),
    endDate: optionalString(data.end_date),
    description: optionalString(data.description),
  };
}

export function projectsAdapter(value: unknown, page = 1, pageSize = 20): Page<Project> {
  const result = collection(value, "projects");
  return {
    items: result.items.map((item) => projectAdapter(item)),
    ...pagination(result.envelope, result.meta, page, pageSize),
  };
}

export function projectStatusAdapter(value: unknown): ProjectStatus {
  const data = object(payload(value), "project status");
  return {
    id: requiredString(data.id, "project_status.id"),
    name: requiredString(data.name, "project_status.name"),
    ...(typeof data.is_active === "boolean" ? { isActive: data.is_active } : {}),
  };
}

export function projectStatusesAdapter(value: unknown): ProjectStatus[] {
  const result = collection(value, "project statuses");
  return result.items.map((item) => projectStatusAdapter(item));
}

export function partyAdapter(value: unknown): Party {
  const data = object(payload(value), "party");
  return {
    id: requiredString(data.id, "party.id"),
    companyId: requiredString(data.company_id, "party.company_id"),
    partyTypeId: requiredString(data.party_type_id, "party.party_type_id"),
    name: requiredString(data.name, "party.name"),
    phone: optionalString(data.phone),
    email: optionalString(data.email),
    address: optionalString(data.address),
    panNo: optionalString(data.pan_no),
    isActive: data.is_active !== false,
  };
}

export function partiesAdapter(value: unknown, page = 1, pageSize = 20): Page<Party> {
  const result = collection(value, "parties");
  return {
    items: result.items.map((item) => partyAdapter(item)),
    ...pagination(result.envelope, result.meta, page, pageSize),
  };
}

export function partyTypeAdapter(value: unknown): PartyType {
  const data = object(payload(value), "party type");
  return {
    id: requiredString(data.id, "party_type.id"),
    name: requiredString(data.name, "party_type.name"),
    ...(typeof data.is_active === "boolean" ? { isActive: data.is_active } : {}),
  };
}

export function partyTypesAdapter(value: unknown): PartyType[] {
  const result = collection(value, "party types");
  return result.items.map((item) => partyTypeAdapter(item));
}

export function accountGroupTypeAdapter(value: unknown): AccountGroupType {
  const data = object(payload(value), "account group type");
  return {
    id: requiredString(data.id, "account_group_type.id"),
    name: requiredString(data.name, "account_group_type.name"),
    ...(typeof data.is_active === "boolean" ? { isActive: data.is_active } : {}),
  };
}

export function accountGroupTypesAdapter(value: unknown): AccountGroupType[] {
  const result = collection(value, "account group types");
  return result.items.map((item) => accountGroupTypeAdapter(item));
}

export function accountGroupAdapter(value: unknown): AccountGroup {
  const data = object(payload(value), "account group");
  return {
    id: requiredString(data.id, "account_group.id"),
    companyId: requiredString(data.company_id, "account_group.company_id"),
    accountGroupTypeId: requiredString(
      data.account_group_type_id,
      "account_group.account_group_type_id",
    ),
    parentGroupId: optionalString(data.parent_group_id),
    name: requiredString(data.name, "account_group.name"),
    isActive: data.is_active !== false,
  };
}

export function accountGroupsAdapter(
  value: unknown,
  page = 1,
  pageSize = 20,
): Page<AccountGroup> {
  const result = collection(value, "account groups");
  return {
    items: result.items.map((item) => accountGroupAdapter(item)),
    ...pagination(result.envelope, result.meta, page, pageSize),
  };
}

function accountGroupNodeAdapter(value: unknown): AccountGroupNode {
  const data = object(payload(value), "account group tree node");
  const group = accountGroupAdapter(data);
  const children = data.children ?? [];
  if (!Array.isArray(children)) throw new Error("Invalid account group children");
  return {
    ...group,
    children: children.map((child) => accountGroupNodeAdapter(child)),
  };
}

export function accountGroupTreeAdapter(value: unknown): AccountGroupNode[] {
  const root = payload(value);
  if (Array.isArray(root)) return root.map((item) => accountGroupNodeAdapter(item));
  const envelope = object(root, "account group tree");
  const items = envelope.items ?? envelope.children;
  if (!Array.isArray(items)) throw new Error("Invalid account group tree response");
  return items.map((item) => accountGroupNodeAdapter(item));
}

export function ledgerAdapter(value: unknown): Ledger {
  const data = object(payload(value), "ledger");
  const balance = data.opening_balance;
  if (typeof balance !== "string" && typeof balance !== "number") {
    throw new Error("Missing ledger.opening_balance");
  }
  return {
    id: requiredString(data.id, "ledger.id"),
    companyId: requiredString(data.company_id, "ledger.company_id"),
    accountGroupId: requiredString(data.account_group_id, "ledger.account_group_id"),
    partyId: optionalString(data.party_id),
    name: requiredString(data.name, "ledger.name"),
    openingBalance: String(balance),
    openingBalanceType: optionalString(data.opening_balance_type),
    isCashBank: data.is_cash_bank === true,
    allowProjectTracking:
      typeof data.allow_project_tracking === "boolean"
        ? data.allow_project_tracking
        : null,
    isActive: data.is_active !== false,
  };
}

export function ledgersAdapter(value: unknown, page = 1, pageSize = 20): Page<Ledger> {
  const result = collection(value, "ledgers");
  return {
    items: result.items.map((item) => ledgerAdapter(item)),
    ...pagination(result.envelope, result.meta, page, pageSize),
  };
}
