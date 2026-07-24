import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { AccountGroupForm } from "@/components/account-group-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import {
  accountGroupDescendantIds,
  flattenAccountGroupTree,
} from "@/lib/account-groups";
import type { AccountGroupFormValue } from "@/lib/account-group-form";
import {
  accountGroupService,
  accountGroupTypeService,
  companyService,
} from "@/lib/services";
import type {
  AccountGroup,
  AccountGroupNode,
  AccountGroupType,
} from "@/types/domain";

export default function EditAccountGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<AccountGroup | null>(null);
  const [tree, setTree] = useState<AccountGroupNode[]>([]);
  const [activeTypes, setActiveTypes] = useState<AccountGroupType[]>([]);
  const [allTypes, setAllTypes] = useState<AccountGroupType[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      accountGroupService.get(id),
      accountGroupTypeService.list(true),
      accountGroupTypeService.list(),
      companyService.current(),
    ])
      .then(async ([item, active, all, company]) => {
        setGroup(item);
        setActiveTypes(active);
        setAllTypes(all);
        setTree(await accountGroupService.tree(company.id));
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load account group"),
      );
  }, [id]);

  const selectableTypes = useMemo(() => {
    if (!group || activeTypes.some((type) => type.id === group.accountGroupTypeId)) {
      return activeTypes;
    }
    const current = allTypes.find((type) => type.id === group.accountGroupTypeId);
    return current ? [current, ...activeTypes] : activeTypes;
  }, [activeTypes, allTypes, group]);

  const allGroups = useMemo(() => flattenAccountGroupTree(tree), [tree]);
  const parentGroups = useMemo(() => {
    if (!group) return allGroups.filter((item) => item.isActive);
    return allGroups.filter(
      (item) => item.isActive || item.id === group.parentGroupId,
    );
  }, [allGroups, group]);
  const excludedIds = useMemo(
    () => group ? accountGroupDescendantIds(tree, group.id) : new Set<string>(),
    [group, tree],
  );

  async function update(value: AccountGroupFormValue) {
    await accountGroupService.update(id, {
      account_group_type_id: value.account_group_type_id,
      parent_group_id: value.parent_group_id,
      name: value.name.trim(),
    });
    router.back();
  }

  if (!group && !error) return <Loading label="Loading account group…" />;
  return (
    <Screen>
      <Header title="Edit account group" subtitle={group?.name} />
      {error ? (
        <Notice message={error} />
      ) : group ? (
        <Card>
          <AccountGroupForm
            group={group}
            types={selectableTypes}
            parentGroups={parentGroups}
            excludedParentIds={excludedIds}
            submitLabel="Save changes"
            onSubmit={update}
          />
        </Card>
      ) : null}
    </Screen>
  );
}
