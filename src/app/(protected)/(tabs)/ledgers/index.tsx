import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountGroupSelect } from "@/components/account-group-select";
import { Button, Card, Empty, Notice } from "@/components/ui";
import { flattenAccountGroupTree } from "@/lib/account-groups";
import { formatNpr } from "@/lib/format";
import { filterLoadedLedgers, mergeUniqueLedgers } from "@/lib/ledgers";
import { hasAnotherProjectPage } from "@/lib/projects";
import {
  accountGroupService,
  companyService,
  ledgerService,
  partyService,
} from "@/lib/services";
import type { AccountGroup, Company, Ledger, Party } from "@/types/domain";

const PAGE_SIZE = 20;
type ActiveFilter = "all" | "active" | "inactive";
type CashFilter = "all" | "cash" | "other";

export default function LedgersScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveFilter>("all");
  const [cash, setCash] = useState<CashFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadingMoreRef = useRef(false);
  const requestGeneration = useRef(0);
  const activeValue = active === "all" ? undefined : active === "active";
  const cashValue = cash === "all" ? undefined : cash === "cash";

  const resolveParties = useCallback(async (items: Ledger[]) => {
    const ids = [...new Set(items.map((item) => item.partyId).filter(Boolean))] as string[];
    const resolved = await Promise.all(
      ids.map(async (id) => {
        try {
          return await partyService.get(id);
        } catch {
          return null;
        }
      }),
    );
    setParties(resolved.filter((party): party is Party => party !== null));
  }, []);

  const loadFirst = useCallback(async (refresh = false) => {
    const request = ++requestGeneration.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const currentCompany = company ?? await companyService.current();
      if (request !== requestGeneration.current) return;
      setCompany(currentCompany);
      const [tree, result] = await Promise.all([
        accountGroupService.tree(currentCompany.id),
        ledgerService.list({
          companyId: currentCompany.id,
          page: 1,
          pageSize: PAGE_SIZE,
          accountGroupId: groupId ?? undefined,
          isCashBank: cashValue,
          isActive: activeValue,
        }),
      ]);
      if (request !== requestGeneration.current) return;
      setGroups(flattenAccountGroupTree(tree));
      setLedgers(result.items);
      setPage(result.page);
      setHasMore(
        hasAnotherProjectPage({
          loadedCount: result.items.length,
          receivedCount: result.items.length,
          pageSize: result.pageSize,
          total: result.total,
        }),
      );
      await resolveParties(result.items);
    } catch (cause) {
      if (request === requestGeneration.current) {
        setError(cause instanceof Error ? cause.message : "Unable to load ledgers");
      }
    } finally {
      if (request === requestGeneration.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [activeValue, cashValue, company, groupId, resolveParties]);

  useFocusEffect(useCallback(() => void loadFirst(), [loadFirst]));

  async function loadMore() {
    if (!company || !hasMore || loadingMoreRef.current || loading || refreshing) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const result = await ledgerService.list({
        companyId: company.id,
        page: page + 1,
        pageSize: PAGE_SIZE,
        accountGroupId: groupId ?? undefined,
        isCashBank: cashValue,
        isActive: activeValue,
      });
      const merged = mergeUniqueLedgers(ledgers, result.items);
      setLedgers(merged);
      setPage(result.page);
      setHasMore(
        hasAnotherProjectPage({
          loadedCount: merged.length,
          receivedCount: result.items.length,
          pageSize: result.pageSize,
          total: result.total,
        }),
      );
      await resolveParties(merged);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load more ledgers");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(
    () => filterLoadedLedgers(ledgers, query),
    [ledgers, query],
  );
  const groupNames = useMemo(
    () => new Map(groups.map((group) => [group.id, group.name])),
    [groups],
  );
  const partyNames = useMemo(
    () => new Map(parties.map((party) => [party.id, party.name])),
    [parties],
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(ledger) => ledger.id}
        contentContainerClassName="grow px-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadFirst(true)} />
        }
        ListHeaderComponent={
          <View className="pt-5">
            <View className="mb-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-3xl font-semibold text-primary">Ledgers</Text>
                <Text className="mt-1 text-sm text-muted">Accounting heads and balances</Text>
              </View>
              <Pressable
                accessibilityLabel="Create ledger"
                onPress={() => router.push("/(protected)/(tabs)/ledgers/create")}
                className="h-12 w-12 items-center justify-center rounded-full bg-accent"
              >
                <Text className="text-3xl text-primary">+</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => router.push("/(protected)/(tabs)/account-groups")}
              className="mb-4 rounded-lg border border-line bg-white p-4"
            >
              <Text className="font-semibold text-primary">Manage account groups →</Text>
              <Text className="mt-1 text-xs text-muted">
                View and maintain the backend accounting hierarchy.
              </Text>
            </Pressable>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search loaded ledgers…"
              placeholderTextColor="#75777d"
              className="mb-4 min-h-12 rounded-lg border border-line bg-white px-4 text-base text-ink"
            />
            <AccountGroupSelect
              groups={groups}
              value={groupId}
              onChange={setGroupId}
              label="Filter by account group"
              allowNone
              noneLabel="All account groups"
            />
            <Text className="mb-2 text-sm font-medium text-muted">Cash/Bank filter</Text>
            <View className="mb-4 flex-row gap-2">
              {(["all", "cash", "other"] as CashFilter[]).map((item) => (
                <FilterChip
                  key={item}
                  label={item === "cash" ? "Cash/Bank" : item}
                  selected={cash === item}
                  onPress={() => setCash(item)}
                />
              ))}
            </View>
            <Text className="mb-2 text-sm font-medium text-muted">Active status</Text>
            <View className="mb-4 flex-row gap-2">
              {(["all", "active", "inactive"] as ActiveFilter[]).map((item) => (
                <FilterChip
                  key={item}
                  label={item}
                  selected={active === item}
                  onPress={() => setActive(item)}
                />
              ))}
            </View>
            {error ? <Notice message={error} /> : null}
            {query ? (
              <Text className="mb-3 text-xs text-muted">
                Searching {ledgers.length} loaded ledgers
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(protected)/(tabs)/ledgers/[id]",
                params: { id: item.id },
              })
            }
            className="mb-3"
          >
            <Card>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-amber">
                    {groupNames.get(item.accountGroupId) ?? "Group unavailable"}
                  </Text>
                  <Text className="mt-1 text-xl font-semibold text-primary">{item.name}</Text>
                  {item.partyId ? (
                    <Text className="mt-1 text-sm text-muted">
                      {partyNames.get(item.partyId) ?? "Party unavailable"}
                    </Text>
                  ) : null}
                </View>
                <Text
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.isActive ? "bg-green-100 text-success" : "bg-slate-200 text-muted"
                  }`}
                >
                  {item.isActive ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
              <View className="mt-4 flex-row items-center justify-between border-t border-line pt-3">
                <Text className="font-semibold text-ink">
                  {formatNpr(item.openingBalance)}
                  {item.openingBalanceType ? ` ${item.openingBalanceType.toUpperCase()}` : ""}
                </Text>
                <Text className="text-xs text-muted">
                  {item.isCashBank ? "Cash/Bank" : "General"}
                  {item.allowProjectTracking ? " · Project tracking" : ""}
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator className="my-12" color="#091426" />
          ) : (
            <Empty
              title={query ? "No loaded ledgers match" : "No ledgers found"}
              message={query ? "Try another search." : "Create the first ledger or change filters."}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator className="my-5" color="#091426" />
          ) : hasMore && !query ? (
            <View className="my-4">
              <Button variant="secondary" title="Load more" onPress={() => void loadMore()} />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (!query) void loadMore();
        }}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-full border px-3 py-2 ${
        selected ? "border-primary bg-primary" : "border-line bg-white"
      }`}
    >
      <Text
        className={`text-center text-xs font-semibold capitalize ${
          selected ? "text-white" : "text-muted"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
