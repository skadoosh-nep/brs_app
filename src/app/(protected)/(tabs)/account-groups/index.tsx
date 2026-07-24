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

import { AccountGroupTypeSelect } from "@/components/account-group-type-select";
import { Button, Card, Empty, Notice } from "@/components/ui";
import {
  filterLoadedAccountGroups,
  generateAccountGroupTreeWhenEmpty,
  mergeUniqueAccountGroups,
} from "@/lib/account-groups";
import { hasAnotherProjectPage } from "@/lib/projects";
import {
  accountGroupService,
  accountGroupTypeService,
  companyService,
} from "@/lib/services";
import type {
  AccountGroup,
  AccountGroupNode,
  AccountGroupType,
  Company,
} from "@/types/domain";

const PAGE_SIZE = 20;
type Mode = "tree" | "list";
type ActiveFilter = "all" | "active" | "inactive";

export default function AccountGroupsScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [tree, setTree] = useState<AccountGroupNode[]>([]);
  const [types, setTypes] = useState<AccountGroupType[]>([]);
  const [mode, setMode] = useState<Mode>("tree");
  const [typeId, setTypeId] = useState("");
  const [active, setActive] = useState<ActiveFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generationError, setGenerationError] = useState("");
  const generationAttempted = useRef(false);
  const loadingMoreRef = useRef(false);
  const requestGeneration = useRef(0);
  const activeValue = active === "all" ? undefined : active === "active";

  const loadFirst = useCallback(async (refresh = false) => {
    const request = ++requestGeneration.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    setGenerationError("");
    try {
      const currentCompany = company ?? await companyService.current();
      if (request !== requestGeneration.current) return;
      setCompany(currentCompany);
      let [groupTypes, treeItems, pageResult] = await Promise.all([
        accountGroupTypeService.list(),
        accountGroupService.tree(currentCompany.id),
        accountGroupService.list({
          companyId: currentCompany.id,
          page: 1,
          pageSize: PAGE_SIZE,
          accountGroupTypeId: typeId || undefined,
          isActive: activeValue,
        }),
      ]);
      if (!treeItems.length && !generationAttempted.current) {
        setGenerating(true);
        try {
          treeItems = await generateAccountGroupTreeWhenEmpty({
            tree: treeItems,
            canGenerate: !generationAttempted.current,
            markAttempted: () => {
              generationAttempted.current = true;
            },
            generate: () => accountGroupService.generateDefaultTree(currentCompany.id),
            reload: () => accountGroupService.tree(currentCompany.id),
          });
          pageResult = await accountGroupService.list({
            companyId: currentCompany.id,
            page: 1,
            pageSize: PAGE_SIZE,
            accountGroupTypeId: typeId || undefined,
            isActive: activeValue,
          });
        } catch (cause) {
          setGenerationError(
            cause instanceof Error ? cause.message : "Unable to generate default account groups",
          );
        } finally {
          setGenerating(false);
        }
      }
      if (request !== requestGeneration.current) return;
      setTypes(groupTypes);
      setTree(treeItems);
      setGroups(pageResult.items);
      setPage(pageResult.page);
      setHasMore(
        hasAnotherProjectPage({
          loadedCount: pageResult.items.length,
          receivedCount: pageResult.items.length,
          pageSize: pageResult.pageSize,
          total: pageResult.total,
        }),
      );
    } catch (cause) {
      if (request === requestGeneration.current) {
        setError(cause instanceof Error ? cause.message : "Unable to load account groups");
      }
    } finally {
      if (request === requestGeneration.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [activeValue, company, typeId]);

  useFocusEffect(useCallback(() => void loadFirst(), [loadFirst]));

  async function loadMore() {
    if (!company || !hasMore || loadingMoreRef.current || loading || refreshing) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const result = await accountGroupService.list({
        companyId: company.id,
        page: page + 1,
        pageSize: PAGE_SIZE,
        accountGroupTypeId: typeId || undefined,
        isActive: activeValue,
      });
      const merged = mergeUniqueAccountGroups(groups, result.items);
      setGroups(merged);
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
      setError(cause instanceof Error ? cause.message : "Unable to load more account groups");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  function retryGeneration() {
    generationAttempted.current = false;
    void loadFirst();
  }

  const filtered = useMemo(
    () => filterLoadedAccountGroups(groups, query),
    [groups, query],
  );
  const typeNames = useMemo(
    () => new Map(types.map((type) => [type.id, type.name])),
    [types],
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <FlatList
        data={mode === "list" ? filtered : []}
        keyExtractor={(group) => group.id}
        contentContainerClassName="grow px-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadFirst(true)} />
        }
        ListHeaderComponent={
          <View className="pt-5">
            <View className="mb-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-3xl font-semibold text-primary">Account groups</Text>
                <Text className="mt-1 text-sm text-muted">Backend-managed accounting hierarchy</Text>
              </View>
              <Pressable
                accessibilityLabel="Create account group"
                onPress={() =>
                  router.push("/(protected)/(tabs)/account-groups/create")
                }
                className="h-12 w-12 items-center justify-center rounded-full bg-accent"
              >
                <Text className="text-3xl text-primary">+</Text>
              </Pressable>
            </View>
            <View className="mb-4 flex-row rounded-lg border border-line bg-white p-1">
              {(["tree", "list"] as Mode[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  className={`flex-1 rounded-md py-3 ${mode === item ? "bg-primary" : ""}`}
                >
                  <Text
                    className={`text-center font-semibold capitalize ${
                      mode === item ? "text-white" : "text-muted"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
            {generating ? (
              <Notice tone="info" message="Creating the backend default account-group tree…" />
            ) : null}
            {generationError ? (
              <View className="mb-4">
                <Notice message={generationError} />
                <Button
                  variant="secondary"
                  title="Retry default generation"
                  onPress={retryGeneration}
                />
              </View>
            ) : null}
            {error ? <Notice message={error} /> : null}
            {mode === "list" ? (
              <>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search loaded groups…"
                  placeholderTextColor="#75777d"
                  className="mb-4 min-h-12 rounded-lg border border-line bg-white px-4 text-base text-ink"
                />
                <AccountGroupTypeSelect
                  types={types}
                  value={typeId}
                  onChange={setTypeId}
                  allowAll
                />
                <View className="mb-4 flex-row gap-2">
                  {(["all", "active", "inactive"] as ActiveFilter[]).map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setActive(item)}
                      className={`flex-1 rounded-full border px-3 py-2 ${
                        active === item
                          ? "border-primary bg-primary"
                          : "border-line bg-white"
                      }`}
                    >
                      <Text
                        className={`text-center text-xs font-semibold capitalize ${
                          active === item ? "text-white" : "text-muted"
                        }`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            {mode === "tree" && !loading ? (
              tree.length ? (
                <View className="mb-4">
                  {tree.map((node) => (
                    <TreeNode key={node.id} node={node} depth={0} typeNames={typeNames} />
                  ))}
                </View>
              ) : !generationError ? (
                <Empty
                  title="No account groups"
                  message="The backend returned an empty account-group hierarchy."
                />
              ) : null
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(protected)/(tabs)/account-groups/[id]",
                params: { id: item.id },
              })
            }
            className="mb-3"
          >
            <Card>
              <View className="flex-row justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-amber">
                    {typeNames.get(item.accountGroupTypeId) ?? "Type unavailable"}
                  </Text>
                  <Text className="mt-1 text-lg font-semibold text-primary">{item.name}</Text>
                </View>
                <Text
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.isActive ? "bg-green-100 text-success" : "bg-slate-200 text-muted"
                  }`}
                >
                  {item.isActive ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          mode === "list" && !loading ? (
            <Empty
              title={query ? "No loaded groups match" : "No account groups found"}
              message={query ? "Try another search." : "Change the filters or create a group."}
            />
          ) : loading ? (
            <ActivityIndicator className="my-12" color="#091426" />
          ) : null
        }
        ListFooterComponent={
          mode === "list" && loadingMore ? (
            <ActivityIndicator className="my-5" color="#091426" />
          ) : mode === "list" && hasMore && !query ? (
            <View className="my-4">
              <Button
                variant="secondary"
                title="Load more"
                onPress={() => void loadMore()}
              />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (mode === "list" && !query) void loadMore();
        }}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
}

function TreeNode({
  node,
  depth,
  typeNames,
}: {
  node: AccountGroupNode;
  depth: number;
  typeNames: Map<string, string>;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <View style={{ marginLeft: depth * 14 }}>
      <View className="mb-2 flex-row items-center rounded-lg border border-line bg-white p-2">
        <Pressable
          accessibilityLabel={expanded ? "Collapse group" : "Expand group"}
          disabled={!node.children.length}
          onPress={() => setExpanded((current) => !current)}
          className="h-10 w-10 items-center justify-center"
        >
          <Text className="text-primary">
            {node.children.length ? (expanded ? "⌄" : "›") : "•"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(protected)/(tabs)/account-groups/[id]",
              params: { id: node.id },
            })
          }
          className="flex-1 flex-row items-center px-2 py-2"
        >
          <View className="flex-1">
            <Text className="font-semibold text-primary">{node.name}</Text>
            <Text className="mt-1 text-xs text-muted">
              {typeNames.get(node.accountGroupTypeId) ?? "Type unavailable"}
            </Text>
          </View>
          {!node.isActive ? (
            <Text className="text-xs font-semibold text-muted">INACTIVE</Text>
          ) : null}
        </Pressable>
      </View>
      {expanded
        ? node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} typeNames={typeNames} />
          ))
        : null}
    </View>
  );
}
