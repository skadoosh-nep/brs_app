import { filterLoadedLedgers, mergeUniqueLedgers } from "@/lib/ledgers";
import type { Ledger } from "@/types/domain";

const ledger = (overrides: Partial<Ledger> = {}): Ledger => ({
  id: "l1",
  companyId: "c1",
  accountGroupId: "g1",
  partyId: null,
  name: "Cash in Hand",
  openingBalance: "0.00",
  openingBalanceType: null,
  isCashBank: true,
  allowProjectTracking: false,
  isActive: true,
  ...overrides,
});

describe("ledger list helpers", () => {
  it("searches loaded ledger names", () => {
    expect(filterLoadedLedgers([ledger(), ledger({ id: "l2", name: "Sales" })], "cash"))
      .toHaveLength(1);
  });

  it("deduplicates paginated ledger records", () => {
    expect(mergeUniqueLedgers(
      [ledger()],
      [ledger({ name: "Duplicate" }), ledger({ id: "l2", name: "Sales" })],
    ).map((item) => item.id)).toEqual(["l1", "l2"]);
  });
});
