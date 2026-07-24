import { apiRequest } from "@/lib/api";
import {
  accountGroupService,
  accountGroupTypeService,
  ledgerService,
} from "@/lib/services";

jest.mock("@/lib/api", () => ({ apiRequest: jest.fn() }));

const mockedRequest = jest.mocked(apiRequest);
const group = {
  id: "g1",
  company_id: "c1",
  account_group_type_id: "t1",
  parent_group_id: null,
  name: "Assets",
  is_active: true,
};
const ledger = {
  id: "l1",
  company_id: "c1",
  account_group_id: "g1",
  party_id: null,
  name: "Cash",
  opening_balance: "0.00",
  opening_balance_type: null,
  is_cash_bank: true,
  allow_project_tracking: false,
  is_active: true,
};

describe("account-group and ledger services", () => {
  beforeEach(() => mockedRequest.mockReset());

  it("uses account-group filters, tree, and default-generation endpoints", async () => {
    mockedRequest.mockResolvedValueOnce([group]);
    await accountGroupService.list({
      companyId: "c1",
      page: 2,
      pageSize: 20,
      accountGroupTypeId: "t1",
      isActive: false,
    });
    mockedRequest.mockResolvedValueOnce([{ ...group, children: [] }]);
    await accountGroupService.tree("c1");
    mockedRequest.mockResolvedValueOnce({});
    await accountGroupService.generateDefaultTree("c1");
    expect(mockedRequest).toHaveBeenNthCalledWith(1, "/account-groups", {
      params: {
        page: 2,
        page_size: 20,
        company_id: "c1",
        account_group_type_id: "t1",
        is_active: false,
      },
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(2, "/account-groups/tree", {
      params: { company_id: "c1" },
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(
      3,
      "/account-groups/generate-default-tree",
      { method: "POST", params: { company_id: "c1" } },
    );
  });

  it("uses account-group type and CRUD endpoints", async () => {
    mockedRequest.mockResolvedValueOnce([{ id: "t1", name: "Asset" }]);
    await accountGroupTypeService.list(true);
    mockedRequest.mockResolvedValue(group);
    await accountGroupService.create({
      company_id: "c1",
      account_group_type_id: "t1",
      parent_group_id: null,
      name: "Assets",
      is_active: true,
    });
    await accountGroupService.update("g1", { is_active: false });
    await accountGroupService.remove("g1");
    expect(mockedRequest).toHaveBeenNthCalledWith(1, "/masters/account-group-types", {
      params: { is_active: true },
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(
      3,
      "/account-groups/g1",
      { method: "PATCH", data: { is_active: false } },
    );
    expect(mockedRequest).toHaveBeenNthCalledWith(
      4,
      "/account-groups/g1",
      { method: "DELETE" },
    );
  });

  it("uses ledger filters and CRUD endpoints with party clearing", async () => {
    mockedRequest.mockResolvedValueOnce([ledger]);
    await ledgerService.list({
      companyId: "c1",
      page: 2,
      pageSize: 20,
      accountGroupId: "g1",
      isCashBank: true,
      isActive: false,
    });
    mockedRequest.mockResolvedValue(ledger);
    await ledgerService.create({
      company_id: "c1",
      account_group_id: "g1",
      party_id: null,
      name: "Cash",
      opening_balance: "0.00",
      opening_balance_type: null,
      is_cash_bank: true,
      allow_project_tracking: false,
      is_active: true,
    });
    await ledgerService.update("l1", { party_id: null, is_active: false });
    await ledgerService.remove("l1");
    expect(mockedRequest).toHaveBeenNthCalledWith(1, "/ledgers", {
      params: {
        page: 2,
        page_size: 20,
        company_id: "c1",
        account_group_id: "g1",
        is_cash_bank: true,
        is_active: false,
      },
    });
    expect(mockedRequest).toHaveBeenNthCalledWith(
      3,
      "/ledgers/l1",
      { method: "PATCH", data: { party_id: null, is_active: false } },
    );
    expect(mockedRequest).toHaveBeenNthCalledWith(
      4,
      "/ledgers/l1",
      { method: "DELETE" },
    );
  });
});
