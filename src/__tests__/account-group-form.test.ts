import {
  accountGroupFormInitialValue,
  validateAccountGroupForm,
} from "@/lib/account-group-form";

describe("account-group form", () => {
  it("requires a type and name", () => {
    expect(validateAccountGroupForm(accountGroupFormInitialValue())).toMatchObject({
      account_group_type_id: expect.any(String),
      name: expect.any(String),
    });
  });

  it("accepts root and nested groups", () => {
    const base = {
      account_group_type_id: "type-1",
      parent_group_id: null,
      name: "Assets",
    };
    expect(validateAccountGroupForm(base)).toEqual({});
    expect(validateAccountGroupForm({ ...base, parent_group_id: "parent-1" })).toEqual({});
  });
});
