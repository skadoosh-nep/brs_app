import { apiRequest } from "@/lib/api";
import { projectService, projectStatusService } from "@/lib/services";

jest.mock("@/lib/api", () => ({ apiRequest: jest.fn() }));

const mockedRequest = jest.mocked(apiRequest);
const projectResponse = {
  id: "p1",
  company_id: "c1",
  project_status_id: "s1",
  project_code: "PRJ-1",
  name: "Bridge",
  client_id: null,
  location: null,
  contract_amount: "100.00",
  start_date: null,
  end_date: null,
  description: null,
};

describe("project services", () => {
  beforeEach(() => mockedRequest.mockReset());

  it("sends pagination and status filters", async () => {
    mockedRequest.mockResolvedValue([projectResponse]);
    await projectService.list({ page: 2, pageSize: 20, projectStatusId: "s1" });
    expect(mockedRequest).toHaveBeenCalledWith("/projects", {
      params: { page: 2, page_size: 20, project_status_id: "s1" },
    });
  });

  it("uses documented create, update, and delete endpoints", async () => {
    mockedRequest.mockResolvedValue(projectResponse);
    await projectService.create({
      company_id: "c1",
      project_status_id: "s1",
      project_code: "PRJ-1",
      name: "Bridge",
      client_id: null,
      location: null,
      contract_amount: "100.00",
      start_date: null,
      end_date: null,
      description: null,
    });
    await projectService.update("p1", { name: "New name", client_id: "party-1" });
    await projectService.remove("p1");
    expect(mockedRequest).toHaveBeenNthCalledWith(
      1,
      "/projects",
      expect.objectContaining({ method: "POST", data: expect.objectContaining({ client_id: null }) }),
    );
    expect(mockedRequest).toHaveBeenNthCalledWith(
      2,
      "/projects/p1",
      { method: "PATCH", data: { name: "New name", client_id: "party-1" } },
    );
    expect(mockedRequest).toHaveBeenNthCalledWith(
      3,
      "/projects/p1",
      { method: "DELETE" },
    );
  });

  it("loads only active project statuses", async () => {
    mockedRequest.mockResolvedValue([{ id: "s1", name: "Ongoing", is_active: true }]);
    await projectStatusService.listActive();
    expect(mockedRequest).toHaveBeenCalledWith("/masters/project-statuses", {
      params: { is_active: true },
    });
  });
});
