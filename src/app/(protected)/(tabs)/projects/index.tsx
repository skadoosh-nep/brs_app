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

import { Button, Card, Empty, Notice } from "@/components/ui";
import { ProjectStatusSelect } from "@/components/project-status-select";
import { formatNpr } from "@/lib/format";
import {
  filterLoadedProjects,
  hasAnotherProjectPage,
  mergeUniqueProjects,
} from "@/lib/projects";
import { projectService, projectStatusService } from "@/lib/services";
import type { Project, ProjectStatus } from "@/types/domain";

const PAGE_SIZE = 20;

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [statusId, setStatusId] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const loadingMoreRef = useRef(false);

  const loadFirstPage = useCallback(async (refresh = false) => {
    const request = ++generation.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [statusItems, result] = await Promise.all([
        projectStatusService.listActive(),
        projectService.list({ page: 1, pageSize: PAGE_SIZE, projectStatusId: statusId || undefined }),
      ]);
      if (request !== generation.current) return;
      setStatuses(statusItems);
      setProjects(result.items);
      setPage(result.page);
      setHasMore(hasAnotherProjectPage({
        loadedCount: result.items.length,
        receivedCount: result.items.length,
        pageSize: result.pageSize,
        total: result.total,
      }));
    } catch (cause) {
      if (request === generation.current) {
        setError(cause instanceof Error ? cause.message : "Unable to load projects");
      }
    } finally {
      if (request === generation.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [statusId]);

  useFocusEffect(
    useCallback(() => {
      void loadFirstPage();
    }, [loadFirstPage]),
  );

  async function loadMore() {
    if (!hasMore || loadingMoreRef.current || loading || refreshing) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const request = generation.current;
    try {
      const result = await projectService.list({
        page: page + 1,
        pageSize: PAGE_SIZE,
        projectStatusId: statusId || undefined,
      });
      if (request !== generation.current) return;
      const merged = mergeUniqueProjects(projects, result.items);
      setProjects(merged);
      setHasMore(hasAnotherProjectPage({
        loadedCount: merged.length,
        receivedCount: result.items.length,
        pageSize: result.pageSize,
        total: result.total,
      }));
      setPage(result.page);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load more projects");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  const filtered = useMemo(() => filterLoadedProjects(projects, query), [projects, query]);

  const statusNames = useMemo(
    () => new Map(statuses.map((status) => [status.id, status.name])),
    [statuses],
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(project) => project.id}
        contentContainerClassName="grow px-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadFirstPage(true)} />
        }
        ListHeaderComponent={
          <View className="pt-5">
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-semibold text-primary">Projects</Text>
                <Text className="mt-1 text-sm text-muted">Construction jobs and contracts</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create project"
                onPress={() => router.push("/(protected)/(tabs)/projects/create")}
                className="h-12 w-12 items-center justify-center rounded-full bg-accent"
              >
                <Text className="text-3xl leading-8 text-primary">+</Text>
              </Pressable>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search loaded projects…"
              placeholderTextColor="#75777d"
              autoCapitalize="none"
              className="mb-4 min-h-12 rounded-lg border border-line bg-white px-4 text-base text-ink"
            />
            <ProjectStatusSelect
              statuses={statuses}
              value={statusId}
              onChange={setStatusId}
              allowAll
            />
            {error ? <Notice message={error} /> : null}
            {query ? (
              <Text className="mb-3 text-xs text-muted">
                Searching {projects.length} loaded project{projects.length === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            statusName={statusNames.get(item.projectStatusId) ?? "Status unavailable"}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#091426" />
              <Text className="mt-3 text-muted">Loading projects…</Text>
            </View>
          ) : (
            <Empty
              title={query ? "No loaded projects match" : "No projects found"}
              message={query ? "Try another name, code, or location." : "Create the first project for this company."}
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

function ProjectCard({ project, statusName }: { project: Project; statusName: string }) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(protected)/(tabs)/projects/[id]",
          params: { id: project.id },
        })
      }
      className="mb-4"
    >
      <Card>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              {project.projectCode}
            </Text>
            <Text className="mt-1 text-xl font-semibold text-primary">{project.name}</Text>
          </View>
          <Text className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber">
            {statusName}
          </Text>
        </View>
        <Text className="mt-3 text-sm text-muted">{project.location ?? "Location not set"}</Text>
        <View className="mt-4 flex-row border-t border-line pt-4">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase text-muted">Contract amount</Text>
            <Text className="mt-1 font-semibold text-ink">{formatNpr(project.contractAmount)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase text-muted">End date</Text>
            <Text className="mt-1 text-ink">{project.endDate ?? "Not set"}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
