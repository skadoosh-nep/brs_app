import { router } from "expo-router";
import { useEffect, useState } from "react";

import { LedgerForm } from "@/components/ledger-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { flattenAccountGroupTree } from "@/lib/account-groups";
import type { LedgerFormValue } from "@/lib/ledger-form";
import {
  accountGroupService,
  companyService,
  ledgerService,
} from "@/lib/services";
import type { AccountGroup, Company } from "@/types/domain";

export default function CreateLedgerScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    companyService.current()
      .then(async (currentCompany) => {
        const tree = await accountGroupService.tree(currentCompany.id);
        setCompany(currentCompany);
        setGroups(flattenAccountGroupTree(tree).filter((group) => group.isActive));
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load ledger setup"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function create(value: LedgerFormValue) {
    if (!company) return;
    const ledger = await ledgerService.create({
      company_id: company.id,
      account_group_id: value.account_group_id,
      party_id: value.party_id,
      name: value.name.trim(),
      opening_balance: value.opening_balance.trim(),
      opening_balance_type: value.opening_balance_type || null,
      is_cash_bank: value.is_cash_bank,
      allow_project_tracking: value.allow_project_tracking,
      is_active: true,
    });
    router.replace({
      pathname: "/(protected)/(tabs)/ledgers/[id]",
      params: { id: ledger.id },
    });
  }

  if (loading) return <Loading label="Loading ledger setup…" />;
  return (
    <Screen>
      <Header title="Create ledger" subtitle="Add an accounting head." />
      {error ? (
        <Notice message={error} />
      ) : groups.length ? (
        <Card>
          <LedgerForm
            accountGroups={groups}
            submitLabel="Create ledger"
            onSubmit={create}
          />
        </Card>
      ) : (
        <Notice message="No active account groups are available. Create or activate a group first." />
      )}
    </Screen>
  );
}
