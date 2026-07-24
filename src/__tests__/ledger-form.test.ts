import {
  ledgerFormInitialValue,
  ledgerNameAfterPartySelection,
  validateLedgerForm,
} from "@/lib/ledger-form";
import type { Party } from "@/types/domain";

describe("ledger form", () => {
  it("requires an account group and name", () => {
    expect(validateLedgerForm(ledgerFormInitialValue())).toMatchObject({
      account_group_id: expect.any(String),
      name: expect.any(String),
    });
  });

  it("rejects negative/non-decimal balances and requires a side for positive values", () => {
    const base = {
      ...ledgerFormInitialValue(),
      account_group_id: "g1",
      name: "Cash",
    };
    expect(validateLedgerForm({ ...base, opening_balance: "-1" }))
      .toMatchObject({ opening_balance: expect.any(String) });
    expect(validateLedgerForm({ ...base, opening_balance: "100" }))
      .toMatchObject({ opening_balance_type: expect.any(String) });
    expect(validateLedgerForm({
      ...base,
      opening_balance: "100.00",
      opening_balance_type: "DR",
    })).toEqual({});
  });

  it("allows zero without a balance type", () => {
    expect(validateLedgerForm({
      ...ledgerFormInitialValue(),
      account_group_id: "g1",
      name: "Sales",
      opening_balance: "0.00",
    })).toEqual({});
  });

  it("normalizes backend balance types to the DR/CR wire contract", () => {
    expect(ledgerFormInitialValue({
      id: "ledger-1",
      companyId: "c1",
      accountGroupId: "g1",
      partyId: null,
      name: "Cash",
      openingBalance: "100.00",
      openingBalanceType: "dr",
      isCashBank: true,
      allowProjectTracking: false,
      isActive: true,
    }).opening_balance_type).toBe("DR");
  });

  it("uses a selected party name while retaining the name when cleared", () => {
    const party: Party = {
      id: "party-1",
      companyId: "c1",
      partyTypeId: "type-1",
      name: "Everest Electronic Pvt",
      phone: null,
      email: null,
      address: null,
      panNo: null,
      isActive: true,
    };
    expect(ledgerNameAfterPartySelection("Old name", party))
      .toBe("Everest Electronic Pvt");
    expect(ledgerNameAfterPartySelection("Everest Electronic Pvt", null))
      .toBe("Everest Electronic Pvt");
  });
});
