import {
  accountGroupAdapter,
  accountGroupsAdapter,
  accountGroupTreeAdapter,
  accountGroupTypesAdapter,
  companyAdapter,
  fiscalYearAdapter,
  fiscalYearsAdapter,
  ledgerAdapter,
  ledgersAdapter,
  partiesAdapter,
  partyAdapter,
  partyTypesAdapter,
  projectAdapter,
  projectsAdapter,
  projectStatusesAdapter,
  sessionAdapter,
} from "./adapters";
import { apiRequest } from "./api";

export type CompanyInput = {
  name: string;
  address?: string | null;
  pan_no: string;
  phone: string;
  email: string;
};

export type FiscalYearInput = {
  company_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type FiscalYearUpdate = Partial<
  Pick<FiscalYearInput, "name" | "start_date" | "end_date">
>;

export type ProjectInput = {
  company_id: string;
  project_status_id: string;
  project_code: string;
  name: string;
  client_id: string | null;
  location: string | null;
  contract_amount: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
};

export type ProjectUpdate = Omit<Partial<ProjectInput>, "company_id">;

export type PartyInput = {
  company_id: string;
  party_type_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  pan_no: string | null;
};

export type PartyUpdate = Omit<Partial<PartyInput>, "company_id"> & {
  is_active?: boolean;
};

export type AccountGroupInput = {
  company_id: string;
  account_group_type_id: string;
  parent_group_id: string | null;
  name: string;
  is_active: boolean;
};

export type AccountGroupUpdate = Omit<Partial<AccountGroupInput>, "company_id">;

export type LedgerInput = {
  company_id: string;
  account_group_id: string;
  party_id: string | null;
  name: string;
  opening_balance: string;
  opening_balance_type: string | null;
  is_cash_bank: boolean;
  allow_project_tracking: boolean;
  is_active: boolean;
};

export type LedgerUpdate = Omit<Partial<LedgerInput>, "company_id">;

export const authService = {
  async login(email: string, password: string) {
    const response = await apiRequest(
      "/auth/login",
      {
        method: "POST",
        data: {
          email,
          password,
        },
      },
      {
        protected: false,
      }
    );

    return sessionAdapter(response);
  },

  signup(input: {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) {
    return apiRequest(
      "/auth/signup",
      {
        method: "POST",
        data: input,
      },
      {
        protected: false,
      }
    );
  },

  logout() {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },
};

export const companyService = {
  async current() {
    const response = await apiRequest("/companies/current");

    return companyAdapter(response);
  },

  async create(input: CompanyInput) {
    const response = await apiRequest("/companies", {
      method: "POST",
      data: input,
    });

    return companyAdapter(response);
  },

  async update(input: CompanyInput) {
    const response = await apiRequest("/companies/current", {
      method: "PUT",
      data: input,
    });

    return companyAdapter(response);
  },
};

export const fiscalYearService = {
  async list(
    options: {
      page?: number;
      pageSize?: number;
      isActive?: boolean;
    } = {}
  ) {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;

    const query = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });

    if (options.isActive !== undefined) {
      query.set("is_active", String(options.isActive));
    }

    const response = await apiRequest(
      `/fiscal-years?${query.toString()}`
    );

    return fiscalYearsAdapter(response, page, pageSize);
  },

  async get(id: string) {
    const response = await apiRequest(`/fiscal-years/${id}`);

    return fiscalYearAdapter(response);
  },

  async create(input: FiscalYearInput) {
    const response = await apiRequest("/fiscal-years", {
      method: "POST",
      data: input,
    });

    return fiscalYearAdapter(response);
  },

  async update(id: string, input: FiscalYearUpdate) {
    const response = await apiRequest(`/fiscal-years/${id}`, {
      method: "PATCH",
      data: input,
    });

    return fiscalYearAdapter(response);
  },

  async activate(id: string) {
    const response = await apiRequest(
      `/fiscal-years/${id}/activate`,
      {
        method: "POST",
      }
    );

    return fiscalYearAdapter(response);
  },
};

export const projectStatusService = {
  async listActive() {
    const response = await apiRequest("/masters/project-statuses", {
      params: { is_active: true },
    });
    return projectStatusesAdapter(response);
  },
};

export const projectService = {
  async list(
    options: { page?: number; pageSize?: number; projectStatusId?: string } = {},
  ) {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const response = await apiRequest("/projects", {
      params: {
        page,
        page_size: pageSize,
        ...(options.projectStatusId
          ? { project_status_id: options.projectStatusId }
          : {}),
      },
    });
    return projectsAdapter(response, page, pageSize);
  },

  async get(id: string) {
    return projectAdapter(await apiRequest(`/projects/${id}`));
  },

  async create(input: ProjectInput) {
    return projectAdapter(await apiRequest("/projects", { method: "POST", data: input }));
  },

  async update(id: string, input: ProjectUpdate) {
    return projectAdapter(await apiRequest(`/projects/${id}`, { method: "PATCH", data: input }));
  },

  async remove(id: string) {
    await apiRequest(`/projects/${id}`, { method: "DELETE" });
  },
};

export const partyTypeService = {
  async list(isActive?: boolean) {
    return partyTypesAdapter(await apiRequest("/masters/party-types", {
      params: isActive === undefined ? {} : { is_active: isActive },
    }));
  },
};

export const partyService = {
  async list(options: {
    page?: number;
    pageSize?: number;
    partyTypeId?: string;
    isActive?: boolean;
  } = {}) {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const response = await apiRequest("/parties", {
      params: {
        page,
        page_size: pageSize,
        ...(options.partyTypeId ? { party_type_id: options.partyTypeId } : {}),
        ...(options.isActive === undefined ? {} : { is_active: options.isActive }),
      },
    });
    return partiesAdapter(response, page, pageSize);
  },
  async get(id: string) {
    return partyAdapter(await apiRequest(`/parties/${id}`));
  },
  async create(input: PartyInput) {
    return partyAdapter(await apiRequest("/parties", { method: "POST", data: input }));
  },
  async update(id: string, input: PartyUpdate) {
    return partyAdapter(await apiRequest(`/parties/${id}`, { method: "PATCH", data: input }));
  },
  async remove(id: string) {
    await apiRequest(`/parties/${id}`, { method: "DELETE" });
  },
};

export const accountGroupTypeService = {
  async list(isActive?: boolean) {
    return accountGroupTypesAdapter(await apiRequest("/masters/account-group-types", {
      params: isActive === undefined ? {} : { is_active: isActive },
    }));
  },
};

export const accountGroupService = {
  async list(options: {
    page?: number;
    pageSize?: number;
    companyId: string;
    accountGroupTypeId?: string;
    isActive?: boolean;
  }) {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const response = await apiRequest("/account-groups", {
      params: {
        page,
        page_size: pageSize,
        company_id: options.companyId,
        ...(options.accountGroupTypeId
          ? { account_group_type_id: options.accountGroupTypeId }
          : {}),
        ...(options.isActive === undefined ? {} : { is_active: options.isActive }),
      },
    });
    return accountGroupsAdapter(response, page, pageSize);
  },
  async tree(companyId: string) {
    return accountGroupTreeAdapter(await apiRequest("/account-groups/tree", {
      params: { company_id: companyId },
    }));
  },
  async generateDefaultTree(companyId: string) {
    await apiRequest("/account-groups/generate-default-tree", {
      method: "POST",
      params: { company_id: companyId },
    });
  },
  async get(id: string) {
    return accountGroupAdapter(await apiRequest(`/account-groups/${id}`));
  },
  async create(input: AccountGroupInput) {
    return accountGroupAdapter(
      await apiRequest("/account-groups", { method: "POST", data: input }),
    );
  },
  async update(id: string, input: AccountGroupUpdate) {
    return accountGroupAdapter(
      await apiRequest(`/account-groups/${id}`, { method: "PATCH", data: input }),
    );
  },
  async remove(id: string) {
    await apiRequest(`/account-groups/${id}`, { method: "DELETE" });
  },
};

export const ledgerService = {
  async list(options: {
    page?: number;
    pageSize?: number;
    companyId: string;
    accountGroupId?: string;
    isCashBank?: boolean;
    isActive?: boolean;
  }) {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const response = await apiRequest("/ledgers", {
      params: {
        page,
        page_size: pageSize,
        company_id: options.companyId,
        ...(options.accountGroupId ? { account_group_id: options.accountGroupId } : {}),
        ...(options.isCashBank === undefined ? {} : { is_cash_bank: options.isCashBank }),
        ...(options.isActive === undefined ? {} : { is_active: options.isActive }),
      },
    });
    return ledgersAdapter(response, page, pageSize);
  },
  async get(id: string) {
    return ledgerAdapter(await apiRequest(`/ledgers/${id}`));
  },
  async create(input: LedgerInput) {
    return ledgerAdapter(await apiRequest("/ledgers", { method: "POST", data: input }));
  },
  async update(id: string, input: LedgerUpdate) {
    return ledgerAdapter(
      await apiRequest(`/ledgers/${id}`, { method: "PATCH", data: input }),
    );
  },
  async remove(id: string) {
    await apiRequest(`/ledgers/${id}`, { method: "DELETE" });
  },
};
