import { projectFormInitialValue, validateProjectForm } from "@/lib/project-form";

describe("project form validation", () => {
  it("requires status, code, and name", () => {
    const errors = validateProjectForm(projectFormInitialValue());
    expect(errors).toMatchObject({
      project_status_id: expect.any(String),
      project_code: expect.any(String),
      name: expect.any(String),
    });
  });

  it("rejects negative amounts and reversed dates", () => {
    const value = {
      ...projectFormInitialValue(),
      project_status_id: "s1",
      project_code: "PRJ-1",
      name: "Bridge",
      contract_amount: "-1",
      start_date: "2027-01-02",
      end_date: "2027-01-01",
    };
    expect(validateProjectForm(value)).toMatchObject({
      contract_amount: expect.any(String),
      end_date: expect.any(String),
    });
  });

  it("accepts a valid project", () => {
    const value = {
      ...projectFormInitialValue(),
      project_status_id: "s1",
      project_code: "PRJ-1",
      name: "Bridge",
      contract_amount: "1000000.00",
      start_date: "2027-01-01",
      end_date: "2027-12-31",
    };
    expect(validateProjectForm(value)).toEqual({});
  });

  it("initializes an existing project client assignment", () => {
    expect(
      projectFormInitialValue({
        id: "p1",
        companyId: "c1",
        projectStatusId: "s1",
        projectCode: "PRJ-1",
        name: "Bridge",
        clientId: "party-1",
        location: null,
        contractAmount: "0.00",
        startDate: null,
        endDate: null,
        description: null,
      }).client_id,
    ).toBe("party-1");
  });
});
