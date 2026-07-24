import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Button, Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { formatNpr } from "@/lib/format";
import {
  accountGroupService,
  ledgerService,
  partyService,
} from "@/lib/services";
import type { AccountGroup, Ledger, Party } from "@/types/domain";

type DetailTab = "details" | "statement" | "vouchers";

export default function LedgerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [group, setGroup] = useState<AccountGroup | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [tab, setTab] = useState<DetailTab>("details");
  const [error, setError] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const item = await ledgerService.get(id);
      setLedger(item);
      const [relatedGroup, relatedParty] = await Promise.all([
        accountGroupService.get(item.accountGroupId),
        item.partyId
          ? partyService.get(item.partyId).catch(() => null)
          : Promise.resolve(null),
      ]);
      setGroup(relatedGroup);
      setParty(relatedParty);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load ledger");
    }
  }, [id]);

  useFocusEffect(useCallback(() => void load(), [load]));

  async function changeStatus() {
    if (!ledger) return;
    setChangingStatus(true);
    try {
      setLedger(await ledgerService.update(ledger.id, { is_active: !ledger.isActive }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update ledger status");
    } finally {
      setChangingStatus(false);
    }
  }

  async function remove() {
    if (!ledger) return;
    setDeleting(true);
    try {
      await ledgerService.remove(ledger.id);
      router.replace("/(protected)/(tabs)/ledgers");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete ledger");
    } finally {
      setDeleting(false);
    }
  }

  function confirmStatusChange() {
    if (!ledger) return;
    const action = ledger.isActive ? "Deactivate" : "Activate";
    Alert.alert(
      `${action} ledger?`,
      "The backend remains authoritative for accounting restrictions.",
      [
        { text: "Cancel", style: "cancel" },
        { text: action, onPress: () => void changeStatus() },
      ],
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Delete ledger?",
      "This permanently removes the ledger. The backend may reject deletion when transactions exist.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void remove() },
      ],
    );
  }

  if (!ledger && !error) return <Loading label="Loading ledger…" />;
  return (
    <Screen>
      <Header title="Ledger" subtitle={ledger?.name} />
      {error ? <Notice message={error} /> : null}
      {ledger ? (
        <>
          <View className="mb-4 flex-row rounded-lg border border-line bg-white p-1">
            {(["details", "statement", "vouchers"] as DetailTab[]).map((item) => (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                className={`flex-1 rounded-md px-2 py-3 ${tab === item ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-center text-xs font-semibold capitalize ${
                    tab === item ? "text-white" : "text-muted"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          {tab === "details" ? (
            <Card>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-amber">
                    {group?.name ?? "Account group unavailable"}
                  </Text>
                  <Text className="mt-1 text-2xl font-semibold text-primary">{ledger.name}</Text>
                </View>
                <Text
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    ledger.isActive ? "bg-green-100 text-success" : "bg-slate-200 text-muted"
                  }`}
                >
                  {ledger.isActive ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
              <Detail
                label="Opening balance"
                value={`${formatNpr(ledger.openingBalance)}${
                  ledger.openingBalanceType
                    ? ` ${ledger.openingBalanceType.toUpperCase()}`
                    : ""
                }`}
              />
              <Detail label="Party" value={party?.name ?? (ledger.partyId ? "Unavailable" : "Not assigned")} />
              <Detail label="Ledger class" value={ledger.isCashBank ? "Cash/Bank" : "General"} />
              <Detail
                label="Project tracking"
                value={ledger.allowProjectTracking ? "Allowed" : "Not allowed"}
              />
              <View className="mt-7 gap-3">
                <Button
                  title="Edit ledger"
                  onPress={() =>
                    router.push({
                      pathname: "/(protected)/(tabs)/ledgers/[id]/edit",
                      params: { id: ledger.id },
                    })
                  }
                />
                <Button
                  variant="secondary"
                  title={ledger.isActive ? "Deactivate ledger" : "Activate ledger"}
                  onPress={confirmStatusChange}
                  loading={changingStatus}
                />
                <Button
                  variant="danger"
                  title="Delete ledger"
                  onPress={confirmDelete}
                  loading={deleting}
                />
              </View>
            </Card>
          ) : (
            <Card>
              <Text className="text-xl font-semibold text-primary">
                {tab === "statement" ? "Ledger statement" : "Related vouchers"}
              </Text>
              <Text className="mt-3 leading-6 text-muted">
                Backend integration pending. This area will be connected in the
                assigned reports or voucher phase.
              </Text>
            </Card>
          )}
        </>
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
      <Text className="mt-1 leading-6 text-ink">{value}</Text>
    </View>
  );
}
