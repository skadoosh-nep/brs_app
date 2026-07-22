import {
  companyAdapter,
  fiscalYearsAdapter,
  projectAdapter,
  projectsAdapter,
  projectStatusesAdapter,
  sessionAdapter,
} from "@/lib/adapters";

describe("API response adapters", () => {
  it("accepts root and data-wrapped token responses", () => {
    expect(sessionAdapter({ access_token: "a", token_type: "bearer" }).accessToken).toBe("a");
    expect(sessionAdapter({ data: { access_token: "b" } })).toEqual({ accessToken: "b", tokenType: "Bearer" });
  });

  it("normalizes a company", () => {
    expect(companyAdapter({ data: { id: "c1", name: "BRS Builders", address: null, pan_no: "123", phone: "9800", email: "a@b.com" } })).toMatchObject({ id: "c1", panNo: "123" });
  });

  it("accepts direct and enveloped fiscal-year collections", () => {
    const item = { id: "f1", company_id: "c1", name: "2082/83", start_date: "2025-04-14", end_date: "2026-04-13", is_active: true };
    expect(fiscalYearsAdapter([item]).items).toHaveLength(1);
    expect(fiscalYearsAdapter({ data: { items: [item], total: 1, page: 1, page_size: 20 } }).total).toBe(1);
  });

  it("rejects malformed required identifiers", () => {
    expect(() => companyAdapter({ name: "Missing id" })).toThrow("company.id");
  });

  it("normalizes projects and preserves decimal amounts as strings", () => {
    const item = {
      id: "p1",
      company_id: "c1",
      project_status_id: "s1",
      project_code: "PRJ-001",
      name: "Bridge",
      client_id: null,
      location: "Kathmandu",
      contract_amount: 1250000.5,
      start_date: null,
      end_date: "2027-01-01",
      description: null,
    };
    expect(projectAdapter({ data: item })).toMatchObject({
      id: "p1",
      contractAmount: "1250000.5",
      location: "Kathmandu",
    });
    expect(projectsAdapter([item]).items).toHaveLength(1);
  });

  it("reads project pagination from response meta", () => {
    const item = {
      id: "p1",
      company_id: "c1",
      project_status_id: "s1",
      project_code: "PRJ-001",
      name: "Bridge",
      contract_amount: "100.00",
    };
    const result = projectsAdapter({
      data: [item],
      meta: { pagination: { page: 2, page_size: 20, total: 42 } },
    });
    expect(result).toMatchObject({ page: 2, pageSize: 20, total: 42 });
  });

  it("normalizes active project statuses", () => {
    expect(projectStatusesAdapter({ data: [{ id: "s1", name: "Ongoing", is_active: true }] }))
      .toEqual([{ id: "s1", name: "Ongoing", isActive: true }]);
  });

  it("rejects malformed projects", () => {
    expect(() => projectAdapter({ id: "p1", contract_amount: "0" }))
      .toThrow("project.company_id");
  });
});
