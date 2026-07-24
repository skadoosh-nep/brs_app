import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button, Card, Header, Loading, Notice, Screen } from "@/components/ui";
import {
  accountGroupService,
  accountGroupTypeService,
} from "@/lib/services";
import type { AccountGroup, AccountGroupType } from "@/types/domain";

export default function AccountGroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<AccountGroup | null>(null);
  const [parent, setParent] = useState<AccountGroup | null>(null);
  const [types, setTypes] = useState<AccountGroupType[]>([]);
  const [error, setError] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [item, groupTypes] = await Promise.all([
        accountGroupService.get(id),
        accountGroupTypeService.list(),
      ]);
      setGroup(item);
      setTypes(groupTypes);
      if (item.parentGroupId) {
        try {
          setParent(await accountGroupService.get(item.parentGroupId));
        } catch {
          setParent(null);
        }
      } else {
        setParent(null);
      }
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load account group");
    }
  }, [id]);

  useFocusEffect(useCallback(() => void load(), [load]));

  const typeName = useMemo(
    () =>
      types.find((type) => type.id === group?.accountGroupTypeId)?.name ??
      "Type unavailable",
    [group, types],
  );

  async function changeStatus() {
    if (!group) return;
    setChangingStatus(true);
    try {
      setGroup(await accountGroupService.update(group.id, { is_active: !group.isActive }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update group status");
    } finally {
      setChangingStatus(false);
    }
  }

  async function remove() {
    if (!group) return;
    setDeleting(true);
    try {
      await accountGroupService.remove(group.id);
      router.replace("/(protected)/(tabs)/account-groups");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete account group");
    } finally {
      setDeleting(false);
    }
  }

  function confirmStatusChange() {
    if (!group) return;
    const action = group.isActive ? "Deactivate" : "Activate";
    Alert.alert(
      `${action} account group?`,
      "The backend remains authoritative for hierarchy and accounting restrictions.",
      [
        { text: "Cancel", style: "cancel" },
        { text: action, onPress: () => void changeStatus() },
      ],
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Delete account group?",
      "This permanently removes the group. The backend may reject groups with children or ledgers.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void remove() },
      ],
    );
  }

  if (!group && !error) return <Loading label="Loading account group…" />;
  return (
    <Screen>
      <Header title="Account group" subtitle={group?.name} />
      {error ? <Notice message={error} /> : null}
      {group ? (
        <Card>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-amber">
                {typeName}
              </Text>
              <Text className="mt-1 text-2xl font-semibold text-primary">{group.name}</Text>
            </View>
            <Text
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                group.isActive ? "bg-green-100 text-success" : "bg-slate-200 text-muted"
              }`}
            >
              {group.isActive ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
          <Detail label="Parent group" value={parent?.name ?? "Root group"} />
          <View className="mt-7 gap-3">
            <Button
              title="Edit account group"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/(tabs)/account-groups/[id]/edit",
                  params: { id: group.id },
                })
              }
            />
            <Button
              variant="secondary"
              title={group.isActive ? "Deactivate group" : "Activate group"}
              onPress={confirmStatusChange}
              loading={changingStatus}
            />
            <Button
              variant="danger"
              title="Delete account group"
              onPress={confirmDelete}
              loading={deleting}
            />
          </View>
        </Card>
      ) : (
        <Button title="Try again" onPress={() => void load()} />
      )}
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View className="mt-5 border-t border-line pt-4">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</Text>
      <Text className="mt-1 text-ink">{value}</Text>
    </View>
  );
}
