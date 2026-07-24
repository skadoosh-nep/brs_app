import type { Party } from "@/types/domain";

export function filterLoadedParties(parties: Party[], query: string): Party[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return parties;
  return parties.filter((party) =>
    [party.name, party.phone ?? "", party.email ?? "", party.panNo ?? "", party.address ?? ""]
      .some((value) => value.toLowerCase().includes(normalized)),
  );
}

export function mergeUniqueParties(current: Party[], incoming: Party[]): Party[] {
  const ids = new Set(current.map((party) => party.id));
  return [...current, ...incoming.filter((party) => !ids.has(party.id))];
}
