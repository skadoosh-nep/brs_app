import { useState } from "react";
import { Switch, Text, View } from "react-native";

import { AccountGroupSelect } from "@/components/account-group-select";
import { BalanceTypeSelect } from "@/components/balance-type-select";
import { PartySelect } from "@/components/party-select";
import { Button, Field } from "@/components/ui";
import {
  ledgerNameAfterPartySelection,
  ledgerFormInitialValue,
  validateLedgerForm,
  type LedgerFormValue,
} from "@/lib/ledger-form";
import { useToastStore } from "@/store/toast";
import { ApiError, type AccountGroup, type Ledger } from "@/types/domain";

export function LedgerForm({
  ledger,
  accountGroups,
  submitLabel,
  onSubmit,
}: {
  ledger?: Ledger;
  accountGroups: AccountGroup[];
  submitLabel: string;
  onSubmit: (value: LedgerFormValue) => Promise<void>;
}) {
  const [value, setValue] = useState(() => ledgerFormInitialValue(ledger));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const showError = useToastStore((state) => state.showError);

  async function submit() {
    const validation = validateLedgerForm(value);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setLoading(true);
    try {
      await onSubmit(value);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setErrors((current) => ({ ...current, ...cause.fieldErrors }));
      } else {
        showError(cause instanceof Error ? cause.message : "Unable to save ledger");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AccountGroupSelect
        groups={accountGroups}
        value={value.account_group_id}
        onChange={(id) => {
          setValue((current) => ({ ...current, account_group_id: id ?? "" }));
          setErrors((current) => ({ ...current, account_group_id: "" }));
        }}
        error={errors.account_group_id}
      />
      <PartySelect
        value={value.party_id}
        label="Party (optional)"
        modalTitle="Select party"
        emptyLabel="No party assigned"
        onChange={(partyId, party) => {
          setValue((current) => ({
            ...current,
            party_id: partyId,
            name: ledgerNameAfterPartySelection(current.name, party),
          }));
          if (party) setErrors((current) => ({ ...current, name: "" }));
        }}
      />
      <Field
        label="Ledger name"
        value={value.name}
        onChangeText={(name) => {
          setValue((current) => ({ ...current, name }));
          setErrors((current) => ({ ...current, name: "" }));
        }}
        error={errors.name}
        autoCapitalize="words"
      />
      <Field
        label="Opening balance"
        value={value.opening_balance}
        onChangeText={(openingBalance) => {
          setValue((current) => ({ ...current, opening_balance: openingBalance }));
          setErrors((current) => ({ ...current, opening_balance: "" }));
        }}
        error={errors.opening_balance}
        keyboardType="decimal-pad"
        hint="Displayed as Nepalese rupees"
      />
      <BalanceTypeSelect
        value={value.opening_balance_type}
        onChange={(openingBalanceType) => {
          setValue((current) => ({
            ...current,
            opening_balance_type: openingBalanceType,
          }));
          setErrors((current) => ({ ...current, opening_balance_type: "" }));
        }}
        error={errors.opening_balance_type}
      />
      <Toggle
        label="Cash or bank ledger"
        description="Use this ledger for cash or bank transactions."
        value={value.is_cash_bank}
        onChange={(isCashBank) =>
          setValue((current) => ({ ...current, is_cash_bank: isCashBank }))
        }
      />
      <Toggle
        label="Allow project tracking"
        description="Allow voucher lines to associate this ledger with projects."
        value={value.allow_project_tracking}
        onChange={(allowProjectTracking) =>
          setValue((current) => ({
            ...current,
            allow_project_tracking: allowProjectTracking,
          }))
        }
      />
      <Button title={submitLabel} onPress={submit} loading={loading} />
    </>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View className="mb-4 flex-row items-center justify-between gap-4 rounded border border-line bg-white p-4">
      <View className="flex-1">
        <Text className="font-semibold text-primary">{label}</Text>
        <Text className="mt-1 text-xs leading-5 text-muted">{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: "#091426" }} />
    </View>
  );
}
