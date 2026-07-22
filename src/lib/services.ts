import {
  companyAdapter,
  fiscalYearAdapter,
  fiscalYearsAdapter,
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

export const authService = {
  async login(email: string, password: string) {
    console.log("login called with email:", email, "password:", password);
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