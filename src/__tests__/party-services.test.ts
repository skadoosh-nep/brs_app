import { apiRequest } from "@/lib/api";
import { partyService, partyTypeService } from "@/lib/services";

jest.mock("@/lib/api", () => ({ apiRequest: jest.fn() }));

const mockedRequest = jest.mocked(apiRequest);
const response = {
  id: "party-1",
  company_id: "c1",
  party_type_id: "type-1",
  name: "Everest Suppliers",
  phone: null,
  email: null,
  address: null,
  pan_no: null,
  is_active: true,
};

describe("party services", () => {
  beforeEach(() => mockedRequest.mockReset());

  it("sends pagination, party-type, and active filters", async () => {
    mockedRequest.mockResolvedValue([response]);
    await partyService.list({
      page: 2,
      pageSize: 20,
      partyTypeId: "type-1",
      isActive: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith("/parties", {
      params: {
        page: 2,
        page_size: 20,
        party_type_id: "type-1",
        is_active: false,
      },
    });
  });

  it("uses the documented create, lifecycle, and delete endpoints", async () => {
    mockedRequest.mockResolvedValue(response);
    await partyService.create({
      company_id: "c1",
      party_type_id: "type-1",
      name: "Everest Suppliers",
      phone: null,
      email: null,
      address: null,
      pan_no: null,
    });
    await partyService.update("party-1", { is_active: false });
    await partyService.remove("party-1");
    expect(mockedRequest).toHaveBeenNthCalledWith(
      1,
      "/parties",
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockedRequest).toHaveBeenNthCalledWith(
      2,
      "/parties/party-1",
      { method: "PATCH", data: { is_active: false } },
    );
    expect(mockedRequest).toHaveBeenNthCalledWith(
      3,
      "/parties/party-1",
      { method: "DELETE" },
    );
  });

  it("loads all or only active party types", async () => {
    mockedRequest.mockResolvedValue([{ id: "type-1", name: "Client" }]);
    await partyTypeService.list();
    await partyTypeService.list(true);
    expect(mockedRequest).toHaveBeenNthCalledWith(
      1,
      "/masters/party-types",
      { params: {} },
    );
    expect(mockedRequest).toHaveBeenNthCalledWith(
      2,
      "/masters/party-types",
      { params: { is_active: true } },
    );
  });
});
