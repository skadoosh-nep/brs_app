import type { FieldErrors, Ledger, Party } from "@/types/domain";

export type LedgerFormValue = {
  account_group_id: string;
  party_id: string | null;
  name: string;
  opening_balance: string;
  opening_balance_type: "DR" | "CR" | "";
  is_cash_bank: boolean;
  allow_project_tracking: boolean;
};

export function ledgerFormInitialValue(ledger?: Ledger): LedgerFormValue {
  const normalizedBalanceType = ledger?.openingBalanceType?.toUpperCase();
  const balanceType =
    normalizedBalanceType === "DR" || normalizedBalanceType === "CR"
      ? normalizedBalanceType
      : "";
  return {
    account_group_id: ledger?.accountGroupId ?? "",
    party_id: ledger?.partyId ?? null,
    name: ledger?.name ?? "",
    opening_balance: ledger?.openingBalance ?? "0.00",
    opening_balance_type: balanceType,
    is_cash_bank: ledger?.isCashBank ?? false,
    allow_project_tracking: ledger?.allowProjectTracking ?? false,
  };
}

export function validateLedgerForm(value: LedgerFormValue): FieldErrors {
  const errors: FieldErrors = {};
  if (!value.account_group_id) errors.account_group_id = "Select an account group";
  if (!value.name.trim()) errors.name = "Ledger name is required";
  if (!/^\d+(\.\d+)?$/.test(value.opening_balance.trim())) {
    errors.opening_balance = "Enter a non-negative amount";
  } else if (Number(value.opening_balance) > 0 && !value.opening_balance_type) {
    errors.opening_balance_type = "Select Debit or Credit";
  }
  return errors;
}

export function ledgerNameAfterPartySelection(
  currentName: string,
  party: Party | null,
): string {
  return party?.name ?? currentName;
}
