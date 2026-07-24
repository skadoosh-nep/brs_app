import type { Ledger } from "@/types/domain";

export function filterLoadedLedgers(ledgers: Ledger[], query: string): Ledger[] {
  const normalized = query.trim().toLowerCase();
  return normalized
    ? ledgers.filter((ledger) => ledger.name.toLowerCase().includes(normalized))
    : ledgers;
}

export function mergeUniqueLedgers(current: Ledger[], incoming: Ledger[]): Ledger[] {
  const ids = new Set(current.map((ledger) => ledger.id));
  return [...current, ...incoming.filter((ledger) => !ids.has(ledger.id))];
}
