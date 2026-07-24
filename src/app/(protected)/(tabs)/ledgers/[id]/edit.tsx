import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { LedgerForm } from "@/components/ledger-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { flattenAccountGroupTree } from "@/lib/account-groups";
import type { LedgerFormValue } from "@/lib/ledger-form";
import {
  accountGroupService,
  companyService,
  ledgerService,
} from "@/lib/services";
import type { AccountGroup, Ledger } from "@/types/domain";

export default function EditLedgerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([ledgerService.get(id), companyService.current()])
      .then(async ([item, company]) => {
        setLedger(item);
        setGroups(flattenAccountGroupTree(await accountGroupService.tree(company.id)));
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load ledger"),
      );
  }, [id]);

  const selectableGroups = useMemo(
    () =>
      groups.filter(
        (group) => group.isActive || group.id === ledger?.accountGroupId,
      ),
    [groups, ledger],
  );

  async function update(value: LedgerFormValue) {
    await ledgerService.update(id, {
      account_group_id: value.account_group_id,
      party_id: value.party_id,
      name: value.name.trim(),
      opening_balance: value.opening_balance.trim(),
      opening_balance_type: value.opening_balance_type || null,
      is_cash_bank: value.is_cash_bank,
      allow_project_tracking: value.allow_project_tracking,
    });
    router.back();
  }

  if (!ledger && !error) return <Loading label="Loading ledger…" />;
  return (
    <Screen>
      <Header title="Edit ledger" subtitle={ledger?.name} />
      {error ? (
        <Notice message={error} />
      ) : ledger ? (
        <Card>
          {ledger.openingBalanceType &&
          ledger.openingBalanceType.toUpperCase() !== "DR" &&
          ledger.openingBalanceType.toUpperCase() !== "CR" ? (
            <Notice
              tone="info"
              message={`The backend returned balance type “${ledger.openingBalanceType}”. Select Debit or Credit before saving.`}
            />
          ) : null}
          <LedgerForm
            ledger={ledger}
            accountGroups={selectableGroups}
            submitLabel="Save changes"
            onSubmit={update}
          />
        </Card>
      ) : null}
    </Screen>
  );
}
