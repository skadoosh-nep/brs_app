import {
  companyAdapter,
  fiscalYearAdapter,
  fiscalYearsAdapter,
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
  client_id: null;
  location: string | null;
  contract_amount: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
};

export type ProjectUpdate = Omit<Partial<ProjectInput>, "company_id" | "client_id">;

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
