import {
  nullablePartyValue,
  partyFormInitialValue,
  validatePartyForm,
} from "@/lib/party-form";

describe("party form", () => {
  it("requires a party type and name", () => {
    expect(validatePartyForm(partyFormInitialValue())).toMatchObject({
      party_type_id: expect.any(String),
      name: expect.any(String),
    });
  });

  it("validates email only when supplied", () => {
    const base = {
      ...partyFormInitialValue(),
      party_type_id: "type-1",
      name: "Supplier",
    };
    expect(validatePartyForm(base)).toEqual({});
    expect(validatePartyForm({ ...base, email: "invalid" })).toMatchObject({
      email: expect.any(String),
    });
    expect(validatePartyForm({ ...base, email: "team@example.com" })).toEqual({});
  });

  it("trims optional values and converts blanks to null", () => {
    expect(nullablePartyValue("  9800000000 ")).toBe("9800000000");
    expect(nullablePartyValue("   ")).toBeNull();
  });
});
