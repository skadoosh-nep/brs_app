import { filterLoadedParties, mergeUniqueParties } from "@/lib/parties";
import type { Party } from "@/types/domain";

const party = (overrides: Partial<Party> = {}): Party => ({
  id: "p1",
  companyId: "c1",
  partyTypeId: "t1",
  name: "Everest Supplier",
  phone: "9800000000",
  email: "hello@everest.test",
  address: "Kathmandu",
  panNo: "12345",
  isActive: true,
  ...overrides,
});

describe("party list helpers", () => {
  it("searches all supported loaded fields", () => {
    const items = [
      party(),
      party({
        id: "p2",
        name: "Other",
        phone: null,
        email: null,
        address: null,
        panNo: null,
      }),
    ];
    expect(filterLoadedParties(items, "everest")).toHaveLength(1);
    expect(filterLoadedParties(items, "9800")).toHaveLength(1);
    expect(filterLoadedParties(items, "12345")).toHaveLength(1);
    expect(filterLoadedParties(items, "kath")).toHaveLength(1);
  });

  it("deduplicates incoming pages by party id", () => {
    expect(
      mergeUniqueParties([party()], [
        party({ name: "Duplicate" }),
        party({ id: "p2", name: "Second" }),
      ]).map((item) => item.id),
    ).toEqual(["p1", "p2"]);
  });
});
