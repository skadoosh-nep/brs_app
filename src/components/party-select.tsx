import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Notice } from "@/components/ui";
import { filterLoadedParties, mergeUniqueParties } from "@/lib/parties";
import { hasAnotherProjectPage } from "@/lib/projects";
import { partyService, partyTypeService } from "@/lib/services";
import type { Party, PartyType } from "@/types/domain";

const PAGE_SIZE = 20;

export function PartySelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [types, setTypes] = useState<PartyType[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (!value) return;
    partyService
      .get(value)
      .then(setSelectedParty)
      .catch(() => setSelectedParty(null));
  }, [value]);

  async function loadFirst() {
    setLoading(true);
    setError("");
    try {
      const [result, partyTypes] = await Promise.all([
        partyService.list({ page: 1, pageSize: PAGE_SIZE, isActive: true }),
        partyTypeService.list(),
      ]);
      setParties(result.items);
      setTypes(partyTypes);
      setPage(result.page);
      setHasMore(
        hasAnotherProjectPage({
          loadedCount: result.items.length,
          receivedCount: result.items.length,
          pageSize: result.pageSize,
          total: result.total,
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load active parties");
    } finally {
      setLoading(false);
    }
  }

  async function show() {
    setOpen(true);
    if (!parties.length) await loadFirst();
  }

  async function loadMore() {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError("");
    try {
      const result = await partyService.list({
        page: page + 1,
        pageSize: PAGE_SIZE,
        isActive: true,
      });
      const merged = mergeUniqueParties(parties, result.items);
      setParties(merged);
      setPage(result.page);
      setHasMore(
        hasAnotherProjectPage({
          loadedCount: merged.length,
          receivedCount: result.items.length,
          pageSize: result.pageSize,
          total: result.total,
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load more parties");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  function choose(party: Party | null) {
    setSelectedParty(party);
    onChange(party?.id ?? null);
    setOpen(false);
  }

  const filtered = useMemo(
    () => filterLoadedParties(parties, query),
    [parties, query],
  );
  const typeNames = useMemo(
    () => new Map(types.map((type) => [type.id, type.name])),
    [types],
  );

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-muted">Client (optional)</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select project client"
        onPress={() => void show()}
        className="min-h-12 justify-center rounded border border-line bg-white px-4"
      >
        <Text className={selectedParty ? "text-ink" : "text-muted"}>
          {value && selectedParty?.id === value
            ? selectedParty.name
            : "No client assigned"}
        </Text>
        {value && selectedParty?.id === value ? (
          <Text className="mt-1 text-xs text-muted">
            {typeNames.get(selectedParty.partyTypeId) ??
              (selectedParty.isActive ? "Active party" : "Inactive party")}
          </Text>
        ) : null}
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-canvas">
          <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
            <View>
              <Text className="text-xl font-semibold text-ink">Select client</Text>
              <Text className="mt-1 text-xs text-muted">Active parties</Text>
            </View>
            <Pressable onPress={() => setOpen(false)} className="p-2">
              <Text className="font-semibold text-amber">Close</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="p-5"
          >
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search loaded parties…"
              placeholderTextColor="#75777d"
              className="mb-4 min-h-12 rounded border border-line bg-white px-4 text-base text-ink"
            />
            <Option
              label="No client assigned"
              detail="Clear the current assignment"
              selected={!value}
              onPress={() => choose(null)}
            />
            {error ? <Notice message={error} /> : null}
            {loading ? <ActivityIndicator className="my-8" color="#091426" /> : null}
            {!loading &&
              filtered.map((party) => (
                <Option
                  key={party.id}
                  label={party.name}
                  detail={typeNames.get(party.partyTypeId) ?? "Party"}
                  selected={party.id === value}
                  onPress={() => choose(party)}
                />
              ))}
            {!loading && filtered.length === 0 ? (
              <Text className="my-8 text-center text-muted">
                No loaded active parties match.
              </Text>
            ) : null}
            {hasMore && !query ? (
              <Button
                variant="secondary"
                title="Load more"
                onPress={() => void loadMore()}
                loading={loadingMore}
              />
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function Option({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-lg border p-4 ${
        selected ? "border-accent bg-amber-50" : "border-line bg-white"
      }`}
    >
      <Text className={selected ? "font-semibold text-primary" : "text-ink"}>{label}</Text>
      <Text className="mt-1 text-xs text-muted">{detail}</Text>
    </Pressable>
  );
}
