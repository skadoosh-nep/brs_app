import { companyAdapter, fiscalYearsAdapter, sessionAdapter } from "@/lib/adapters";

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
});
