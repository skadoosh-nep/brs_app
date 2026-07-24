import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Card, Empty, Loading, Notice, Screen } from "@/components/ui";
import { formatNpr } from "@/lib/format";
import {
  authService,
  companyService,
  fiscalYearService,
  projectService,
  projectStatusService,
} from "@/lib/services";
import { useAuthStore } from "@/store/auth";
import type { Company, FiscalYear, Project, ProjectStatus } from "@/types/domain";

export default function HomeScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [year, setYear] = useState<FiscalYear | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");
  const clearSession = useAuthStore((state) => state.clearSession);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setProjectError("");
    try {
      const [currentCompany, fiscalYears] = await Promise.all([
        companyService.current(),
        fiscalYearService.list({ isActive: true }),
      ]);
      setCompany(currentCompany);
      setYear(fiscalYears.items[0] ?? null);

      try {
        const [projectPage, projectStatuses] = await Promise.all([
          projectService.list({ page: 1, pageSize: 3 }),
          projectStatusService.listActive(),
        ]);
        setProjects(projectPage.items);
        setStatuses(projectStatuses);
      } catch (cause) {
        setProjectError(cause instanceof Error ? cause.message : "Unable to load recent projects");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load workspace");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const statusNames = useMemo(
    () => new Map(statuses.map((status) => [status.id, status.name])),
    [statuses],
  );

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Local logout must still succeed when the server is unavailable.
    } finally {
      clearSession();
      router.replace("/(auth)/login");
    }
  }

  function confirmLogout() {
    Alert.alert("Log out of BRS?", "Your access token is stored only for this app session.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => void logout() },
    ]);
  }

  if (loading && !company) return <Loading label="Loading your workspace…" />;

  return (
    <Screen>
      <View className="mb-7 flex-row items-center justify-between border-b border-line pb-4">
        <View>
          <Text className="text-2xl font-bold tracking-tight text-primary">BRS</Text>
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
            Management Suite
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={confirmLogout}
          className="rounded-full border border-line bg-white px-4 py-2"
        >
          <Text className="text-sm font-semibold text-primary">Log out</Text>
        </Pressable>
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold uppercase tracking-widest text-amber">
          Workspace overview
        </Text>
        <Text className="mt-2 text-3xl font-semibold text-primary">
          Welcome to BRS
        </Text>
        <Text className="mt-2 text-base text-muted">
          {company?.name ?? "Your construction workspace"}
        </Text>
      </View>

      {error ? <Notice message={error} /> : null}

      <Pressable
        onPress={() => router.push("/(protected)/fiscal-years")}
        className="mb-7 rounded-xl bg-primary p-5"
      >
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-300">
          Active workspace
        </Text>
        <Text className="mt-2 text-xl font-semibold text-white">
          {company?.name ?? "Company not configured"}
        </Text>
        <Text className="mt-1 text-sm text-slate-300">PAN {company?.panNo ?? "—"}</Text>
        <View className="my-4 h-px bg-slate-700" />
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase text-slate-400">Fiscal year</Text>
            <Text className="mt-1 text-lg font-semibold text-white">{year?.name ?? "Not active"}</Text>
          </View>
          <View className="flex-[1.5]">
            <Text className="text-xs font-semibold uppercase text-slate-400">Period</Text>
            <Text className="mt-1 text-sm text-white">
              {year ? `${year.startDate} — ${year.endDate}` : "Set an active fiscal year"}
            </Text>
          </View>
        </View>
        <Text className="mt-4 text-xs font-bold uppercase tracking-wider text-amber">
          Manage fiscal years →
        </Text>
      </Pressable>

      <Text className="mb-3 text-base font-semibold text-primary">Quick actions</Text>
      <View className="mb-7 flex-row gap-3">
        <QuickAction symbol="▣" label="Projects" onPress={() => router.push("/(protected)/(tabs)/projects")} />
        <QuickAction symbol="◎" label="Parties" onPress={() => router.push("/(protected)/(tabs)/parties")} />
        <QuickAction symbol="⌂" label="Company" onPress={() => router.push("/(protected)/company")} />
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-primary">Recent projects</Text>
        <Pressable onPress={() => router.push("/(protected)/(tabs)/projects")} className="p-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-amber">View all</Text>
        </Pressable>
      </View>

      {projectError ? <Notice message={projectError} /> : null}
      {!projectError && projects.length === 0 ? (
        <Empty title="No projects yet" message="Create your first construction project from the Projects tab." />
      ) : null}
      {projects.map((project) => (
        <Pressable
          key={project.id}
          onPress={() => router.push({
            pathname: "/(protected)/(tabs)/projects/[id]",
            params: { id: project.id },
          })}
          className="mb-3"
        >
          <Card>
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-muted">
                  {project.projectCode}
                </Text>
                <Text className="mt-1 text-lg font-semibold text-primary">{project.name}</Text>
                <Text className="mt-1 text-sm text-muted">{project.location ?? "Location not set"}</Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Text className="font-bold text-amber">↗</Text>
              </View>
            </View>
            <View className="mt-4 flex-row items-center justify-between border-t border-line pt-3">
              <Text className="text-sm font-semibold text-ink">{formatNpr(project.contractAmount)}</Text>
              <Text className="text-xs font-semibold text-amber">
                {statusNames.get(project.projectStatusId) ?? "Status unavailable"}
              </Text>
            </View>
          </Card>
        </Pressable>
      ))}

      <Pressable onPress={() => void load()} className="mt-3 items-center p-3">
        <Text className="text-sm font-semibold text-muted">
          {loading ? "Refreshing…" : "Refresh dashboard"}
        </Text>
      </Pressable>
    </Screen>
  );
}

function QuickAction({
  symbol,
  label,
  onPress,
}: {
  symbol: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-28 flex-1 items-center justify-center rounded-xl border border-line border-l-4 border-l-accent bg-white px-2 py-4"
    >
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-amber-100">
        <Text className="text-xl font-bold text-primary">{symbol}</Text>
      </View>
      <Text className="text-center text-xs font-bold uppercase tracking-wide text-primary">{label}</Text>
    </Pressable>
  );
}
