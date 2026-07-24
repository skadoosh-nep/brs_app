import {
  accountGroupAdapter,
  accountGroupsAdapter,
  accountGroupTreeAdapter,
  accountGroupTypesAdapter,
  companyAdapter,
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

  it("normalizes party entities and nullable contact fields", () => {
    const item = {
      id: "party-1",
      company_id: "c1",
      party_type_id: "type-1",
      name: "Everest Suppliers",
      phone: null,
      email: "hello@example.com",
      address: "",
      pan_no: "123456",
      is_active: false,
    };
    expect(partyAdapter({ data: item })).toMatchObject({
      id: "party-1",
      email: "hello@example.com",
      address: null,
      panNo: "123456",
      isActive: false,
    });
    expect(partiesAdapter([item]).items).toHaveLength(1);
  });

  it("reads party collections and pagination from data or meta envelopes", () => {
    const item = {
      id: "party-1",
      company_id: "c1",
      party_type_id: "type-1",
      name: "Everest Suppliers",
    };
    expect(
      partiesAdapter({
        data: { items: [item], page: 2, page_size: 10, total: 21 },
      }),
    ).toMatchObject({ page: 2, pageSize: 10, total: 21 });
    expect(
      partiesAdapter({
        data: [item],
        meta: { pagination: { page: 3, page_size: 20, total: 45 } },
      }),
    ).toMatchObject({ page: 3, pageSize: 20, total: 45 });
  });

  it("normalizes party types and rejects parties without identifiers", () => {
    expect(
      partyTypesAdapter({ items: [{ id: "type-1", name: "Client", is_active: true }] }),
    ).toEqual([{ id: "type-1", name: "Client", isActive: true }]);
    expect(() => partyAdapter({ company_id: "c1", party_type_id: "t1", name: "Missing id" }))
      .toThrow("party.id");
  });

  it("normalizes account groups, types, pagination, and nested trees", () => {
    const child = {
      id: "g2",
      company_id: "c1",
      account_group_type_id: "t1",
      parent_group_id: "g1",
      name: "Current Assets",
      is_active: true,
      children: [],
    };
    const root = {
      id: "g1",
      company_id: "c1",
      account_group_type_id: "t1",
      parent_group_id: null,
      name: "Assets",
      is_active: true,
      children: [child],
    };
    expect(accountGroupAdapter({ data: root })).toMatchObject({
      id: "g1",
      parentGroupId: null,
    });
    expect(accountGroupTreeAdapter({ data: [root] })[0].children[0].id).toBe("g2");
    expect(accountGroupsAdapter({
      data: { items: [root], page: 2, page_size: 10, total: 11 },
    })).toMatchObject({ page: 2, pageSize: 10, total: 11 });
    expect(accountGroupTypesAdapter([{ id: "t1", name: "Asset", is_active: true }]))
      .toEqual([{ id: "t1", name: "Asset", isActive: true }]);
  });

  it("normalizes ledgers and preserves opening balances as decimal strings", () => {
    const item = {
      id: "l1",
      company_id: "c1",
      account_group_id: "g1",
      party_id: null,
      name: "Cash in Hand",
      opening_balance: 1250.5,
      opening_balance_type: "DR",
      is_cash_bank: true,
      allow_project_tracking: false,
      is_active: true,
    };
    expect(ledgerAdapter({ data: item })).toMatchObject({
      id: "l1",
      openingBalance: "1250.5",
      openingBalanceType: "DR",
      isCashBank: true,
    });
    expect(ledgersAdapter({
      data: [item],
      meta: { pagination: { page: 3, page_size: 20, total: 50 } },
    })).toMatchObject({ page: 3, pageSize: 20, total: 50 });
  });

  it("rejects malformed account groups and ledgers", () => {
    expect(() => accountGroupAdapter({
      id: "g1",
      company_id: "c1",
      name: "Missing type",
    })).toThrow("account_group.account_group_type_id");
    expect(() => ledgerAdapter({
      id: "l1",
      company_id: "c1",
      account_group_id: "g1",
      name: "Missing balance",
    })).toThrow("ledger.opening_balance");
  });
});
