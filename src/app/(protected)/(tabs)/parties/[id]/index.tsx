import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Button, Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { partyService, partyTypeService } from "@/lib/services";
import type { Party, PartyType } from "@/types/domain";

type DetailTab = "profile" | "ledgers" | "vouchers";

export default function PartyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [party, setParty] = useState<Party | null>(null);
  const [types, setTypes] = useState<PartyType[]>([]);
  const [tab, setTab] = useState<DetailTab>("profile");
  const [error, setError] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [item, partyTypes] = await Promise.all([
        partyService.get(id),
        partyTypeService.list(),
      ]);
      setParty(item);
      setTypes(partyTypes);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load party");
    }
  }, [id]);

  useFocusEffect(useCallback(() => void load(), [load]));

  const typeName = useMemo(
    () => types.find((type) => type.id === party?.partyTypeId)?.name ?? "Type unavailable",
    [party, types],
  );

  async function changeStatus() {
    if (!party) return;
    setChangingStatus(true);
    setError("");
    try {
      setParty(await partyService.update(party.id, { is_active: !party.isActive }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update party status");
    } finally {
      setChangingStatus(false);
    }
  }

  async function remove() {
    if (!party) return;
    setDeleting(true);
    setError("");
    try {
      await partyService.remove(party.id);
      router.replace("/(protected)/(tabs)/parties");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete party");
    } finally {
      setDeleting(false);
    }
  }

  function confirmStatusChange() {
    if (!party) return;
    const action = party.isActive ? "Deactivate" : "Activate";
    Alert.alert(
      `${action} party?`,
      party.isActive
        ? "The party will no longer appear in active project-client selections."
        : "The party will be available for project-client selection.",
      [
        { text: "Cancel", style: "cancel" },
        { text: action, onPress: () => void changeStatus() },
      ],
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Delete party?",
      "This permanently removes the party. The backend may reject deletion when related records exist.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void remove() },
      ],
    );
  }

  if (!party && !error) return <Loading label="Loading party…" />;

  return (
    <Screen>
      <Header title="Party profile" subtitle={party?.name} />
      {error ? <Notice message={error} /> : null}
      {party ? (
        <>
          <View className="mb-4 flex-row rounded-lg border border-line bg-white p-1">
            {(["profile", "ledgers", "vouchers"] as DetailTab[]).map((item) => (
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

          {tab === "profile" ? (
            <Card>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-amber">
                    {typeName}
                  </Text>
                  <Text className="mt-1 text-2xl font-semibold text-primary">{party.name}</Text>
                </View>
                <Text
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    party.isActive ? "bg-green-100 text-success" : "bg-slate-200 text-muted"
                  }`}
                >
                  {party.isActive ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
              <Detail label="Phone" value={party.phone ?? "Not set"} />
              <Detail label="Email" value={party.email ?? "Not set"} />
              <Detail label="Address" value={party.address ?? "Not set"} />
              <Detail label="PAN number" value={party.panNo ?? "Not set"} />
              <View className="mt-7 gap-3">
                <Button
                  title="Edit party"
                  onPress={() =>
                    router.push({
                      pathname: "/(protected)/(tabs)/parties/[id]/edit",
                      params: { id: party.id },
                    })
                  }
                />
                <Button
                  variant="secondary"
                  title={party.isActive ? "Deactivate party" : "Activate party"}
                  onPress={confirmStatusChange}
                  loading={changingStatus}
                />
                <Button
                  variant="danger"
                  title="Delete party"
                  onPress={confirmDelete}
                  loading={deleting}
                />
              </View>
            </Card>
          ) : (
            <Card>
              <Text className="text-xl font-semibold text-primary">
                Related {tab === "ledgers" ? "Ledgers" : "Vouchers"}
              </Text>
              <Text className="mt-3 leading-6 text-muted">
                Backend integration pending. This area will be connected when a
                party-filtered endpoint is available.
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
