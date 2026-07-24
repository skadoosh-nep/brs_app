import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button, Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { formatNpr } from "@/lib/format";
import { partyService, partyTypeService, projectService, projectStatusService } from "@/lib/services";
import type { Party, Project } from "@/types/domain";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [statusName, setStatusName] = useState("");
  const [client, setClient] = useState<Party | null>(null);
  const [clientTypeName, setClientTypeName] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [item, statuses] = await Promise.all([
        projectService.get(id),
        projectStatusService.listActive(),
      ]);
      setProject(item);
      setStatusName(
        statuses.find((status) => status.id === item.projectStatusId)?.name ?? "Status unavailable",
      );
      if (item.clientId) {
        const [assignedClient, partyTypes] = await Promise.all([
          partyService.get(item.clientId),
          partyTypeService.list(),
        ]);
        setClient(assignedClient);
        setClientTypeName(
          partyTypes.find((type) => type.id === assignedClient.partyTypeId)?.name ??
            "Type unavailable",
        );
      } else {
        setClient(null);
        setClientTypeName("");
      }
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load project");
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function remove() {
    setDeleting(true);
    setError("");
    try {
      await projectService.remove(id);
      router.replace("/(protected)/(tabs)/projects");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete project");
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete project?",
      "This permanently removes the project. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void remove() },
      ],
    );
  }

  if (!project && !error) return <Loading label="Loading project…" />;

  return (
    <Screen>
      <Header title="Project summary" subtitle={project?.projectCode} />
      {error ? <Notice message={error} /> : null}
      {project ? (
        <Card>
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-2xl font-semibold text-primary">{project.name}</Text>
            <Text className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber">
              {statusName}
            </Text>
          </View>
          <Detail label="Location" value={project.location ?? "Not set"} />
          <Detail label="Contract amount" value={formatNpr(project.contractAmount)} />
          <Detail label="Start date" value={project.startDate ?? "Not set"} />
          <Detail label="End date" value={project.endDate ?? "Not set"} />
          <Detail label="Description" value={project.description ?? "Not set"} />
          {project.clientId ? (
            <Detail
              label="Client assigned"
              value={client ? `${client.name} · ${clientTypeName}` : "Unable to resolve client"}
            />
          ) : null}
          <View className="mt-7 gap-3">
            <Button
              title="Edit project"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/(tabs)/projects/[id]/edit",
                  params: { id },
                })
              }
            />
            <Button
              variant="danger"
              title="Delete project"
              onPress={confirmDelete}
              loading={deleting}
            />
            <Button variant="secondary" title="Back to projects" onPress={() => router.back()} />
          </View>
        </Card>
      ) : (
        <Button title="Try again" onPress={load} />
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
