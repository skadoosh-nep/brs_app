import { router } from "expo-router";
import { useEffect, useState } from "react";

import { AccountGroupForm } from "@/components/account-group-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { flattenAccountGroupTree } from "@/lib/account-groups";
import type { AccountGroupFormValue } from "@/lib/account-group-form";
import {
  accountGroupService,
  accountGroupTypeService,
  companyService,
} from "@/lib/services";
import type { AccountGroup, AccountGroupType, Company } from "@/types/domain";

export default function CreateAccountGroupScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [types, setTypes] = useState<AccountGroupType[]>([]);
  const [parents, setParents] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    companyService.current()
      .then(async (currentCompany) => {
        const [activeTypes, tree] = await Promise.all([
          accountGroupTypeService.list(true),
          accountGroupService.tree(currentCompany.id),
        ]);
        setCompany(currentCompany);
        setTypes(activeTypes);
        setParents(flattenAccountGroupTree(tree).filter((group) => group.isActive));
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load account-group setup"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function create(value: AccountGroupFormValue) {
    if (!company) return;
    const group = await accountGroupService.create({
      company_id: company.id,
      account_group_type_id: value.account_group_type_id,
      parent_group_id: value.parent_group_id,
      name: value.name.trim(),
      is_active: true,
    });
    router.replace({
      pathname: "/(protected)/(tabs)/account-groups/[id]",
      params: { id: group.id },
    });
  }

  if (loading) return <Loading label="Loading account-group setup…" />;
  return (
    <Screen>
      <Header title="Create account group" subtitle="Add a backend-managed hierarchy node." />
      {error ? (
        <Notice message={error} />
      ) : types.length ? (
        <Card>
          <AccountGroupForm
            types={types}
            parentGroups={parents}
            submitLabel="Create account group"
            onSubmit={create}
          />
        </Card>
      ) : (
        <Notice message="No active account-group types are available." />
      )}
    </Screen>
  );
}
