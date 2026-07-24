import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Empty, Notice } from "@/components/ui";
import { PartyTypeSelect } from "@/components/party-type-select";
import { filterLoadedParties, mergeUniqueParties } from "@/lib/parties";
import { hasAnotherProjectPage } from "@/lib/projects";
import { partyService, partyTypeService } from "@/lib/services";
import type { Party, PartyType } from "@/types/domain";

const PAGE_SIZE = 20;
type ActiveFilter = "all" | "active" | "inactive";

export default function PartiesScreen() {
  const [parties, setParties] = useState<Party[]>([]); const [types, setTypes] = useState<PartyType[]>([]);
  const [typeId, setTypeId] = useState(""); const [active, setActive] = useState<ActiveFilter>("all"); const [query, setQuery] = useState("");
  const [page, setPage] = useState(1); const [hasMore, setHasMore] = useState(false); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [loadingMore, setLoadingMore] = useState(false); const [error, setError] = useState("");
  const generation = useRef(0); const loadingMoreRef = useRef(false);
  const activeValue = active === "all" ? undefined : active === "active";

  const loadFirst = useCallback(async (refresh = false) => {
    const request = ++generation.current; if (refresh) setRefreshing(true); else setLoading(true); setError("");
    try {
      const [partyTypes, result] = await Promise.all([partyTypeService.list(), partyService.list({ page: 1, pageSize: PAGE_SIZE, partyTypeId: typeId || undefined, isActive: activeValue })]);
      if (request !== generation.current) return;
      setTypes(partyTypes); setParties(result.items); setPage(result.page);
      setHasMore(hasAnotherProjectPage({ loadedCount: result.items.length, receivedCount: result.items.length, pageSize: result.pageSize, total: result.total }));
    } catch (cause) { if (request === generation.current) setError(cause instanceof Error ? cause.message : "Unable to load parties"); }
    finally { if (request === generation.current) { setLoading(false); setRefreshing(false); } }
  }, [activeValue, typeId]);

  useFocusEffect(useCallback(() => { void loadFirst(); }, [loadFirst]));

  async function loadMore() {
    if (!hasMore || loadingMoreRef.current || loading || refreshing) return; loadingMoreRef.current = true; setLoadingMore(true); const request = generation.current;
    try {
      const result = await partyService.list({ page: page + 1, pageSize: PAGE_SIZE, partyTypeId: typeId || undefined, isActive: activeValue });
      if (request !== generation.current) return;
      const merged = mergeUniqueParties(parties, result.items); setParties(merged); setPage(result.page);
      setHasMore(hasAnotherProjectPage({ loadedCount: merged.length, receivedCount: result.items.length, pageSize: result.pageSize, total: result.total }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load more parties"); }
    finally { loadingMoreRef.current = false; setLoadingMore(false); }
  }

  const filtered = useMemo(() => filterLoadedParties(parties, query), [parties, query]);
  const typeNames = useMemo(() => new Map(types.map((type) => [type.id, type.name])), [types]);
  return <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
    <FlatList data={filtered} keyExtractor={(party) => party.id} contentContainerClassName="grow px-4 pb-8"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadFirst(true)} />}
      ListHeaderComponent={<View className="pt-5">
        <View className="mb-5 flex-row items-center justify-between"><View><Text className="text-3xl font-semibold text-primary">Parties</Text><Text className="mt-1 text-sm text-muted">Clients, vendors, and contractors</Text></View><Pressable accessibilityLabel="Create party" onPress={() => router.push("/(protected)/(tabs)/parties/create")} className="h-12 w-12 items-center justify-center rounded-full bg-accent"><Text className="text-3xl text-primary">+</Text></Pressable></View>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search loaded parties…" placeholderTextColor="#75777d" className="mb-4 min-h-12 rounded-lg border border-line bg-white px-4 text-base text-ink" />
        <PartyTypeSelect types={types} value={typeId} onChange={setTypeId} allowAll />
        <View className="mb-4 flex-row gap-2">{(["all", "active", "inactive"] as ActiveFilter[]).map((item) => <Pressable key={item} onPress={() => setActive(item)} className={`flex-1 rounded-full border px-3 py-2 ${active === item ? "border-primary bg-primary" : "border-line bg-white"}`}><Text className={`text-center text-xs font-semibold capitalize ${active === item ? "text-white" : "text-muted"}`}>{item}</Text></Pressable>)}</View>
        {error ? <Notice message={error} /> : null}{query ? <Text className="mb-3 text-xs text-muted">Searching {parties.length} loaded parties</Text> : null}
      </View>}
      renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/(protected)/(tabs)/parties/[id]", params: { id: item.id } })} className="mb-3"><Card><View className="flex-row justify-between gap-3"><View className="flex-1"><Text className="text-xs font-bold uppercase tracking-wider text-amber">{typeNames.get(item.partyTypeId) ?? "Type unavailable"}</Text><Text className="mt-1 text-xl font-semibold text-primary">{item.name}</Text></View><Text className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isActive ? "bg-green-100 text-success" : "bg-slate-200 text-muted"}`}>{item.isActive ? "ACTIVE" : "INACTIVE"}</Text></View>{item.phone ? <Text className="mt-3 text-sm text-ink">{item.phone}</Text> : null}{item.email ? <Text className="mt-1 text-sm text-muted">{item.email}</Text> : null}{item.address ? <Text className="mt-3 border-t border-line pt-3 text-sm text-muted">{item.address}</Text> : null}{item.panNo ? <Text className="mt-1 text-xs font-semibold text-muted">PAN {item.panNo}</Text> : null}</Card></Pressable>}
      ListEmptyComponent={loading ? <ActivityIndicator className="my-12" color="#091426" /> : <Empty title={query ? "No loaded parties match" : "No parties found"} message={query ? "Try another search." : "Create the first party for this company."} />}
      ListFooterComponent={loadingMore ? <ActivityIndicator className="my-5" color="#091426" /> : hasMore && !query ? <View className="my-4"><Button variant="secondary" title="Load more" onPress={() => void loadMore()} /></View> : null}
      onEndReached={() => { if (!query) void loadMore(); }} onEndReachedThreshold={0.3}
    />
  </SafeAreaView>;
}
