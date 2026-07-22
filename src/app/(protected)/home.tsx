import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import {
  Button,
  Card,
  Header,
  Loading,
  Notice,
  Screen,
} from "@/components/ui";
import {
  authService,
  companyService,
  fiscalYearService,
} from "@/lib/services";
import { useAuthStore } from "@/store/auth";
import type { Company, FiscalYear } from "@/types/domain";

export default function HomeScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [year, setYear] = useState<FiscalYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearSession = useAuthStore(
    (state) => state.clearSession
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [currentCompany, fiscalYears] = await Promise.all([
        companyService.current(),
        fiscalYearService.list({
          isActive: true,
        }),
      ]);

      setCompany(currentCompany);
      setYear(fiscalYears.items[0] ?? null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load workspace"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // The local session should still be cleared if logout fails.
    } finally {
      clearSession();
      router.replace("/(auth)/login");
    }
  }

  if (loading && !company) {
    return <Loading />;
  }

  return (
    <Screen>
      <Header
        title="Your BRS workspace"
        subtitle="Phase 1 company and fiscal-year setup"
      />

      {error ? <Notice message={error} /> : null}

      <Card className="mb-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-amber">
          Current company
        </Text>

        <Text className="mt-2 text-xl font-semibold text-ink">
          {company?.name ?? "Not configured"}
        </Text>

        <Text className="mt-1 text-muted">
          PAN {company?.panNo ?? "—"}
        </Text>

        <View className="mt-4">
          <Button
            variant="secondary"
            title="Manage company"
            onPress={() =>
              router.push("/(protected)/company")
            }
          />
        </View>
      </Card>

      <Card className="mb-6">
        <Text className="text-xs font-bold uppercase tracking-wider text-amber">
          Active fiscal year
        </Text>

        <Text className="mt-2 text-xl font-semibold text-ink">
          {year?.name ?? "No active fiscal year"}
        </Text>

        <Text className="mt-1 text-muted">
          {year
            ? `${year.startDate} — ${year.endDate}`
            : "Create or activate a fiscal year to continue."}
        </Text>

        <View className="mt-4">
          <Button
            variant="secondary"
            title="Manage fiscal years"
            onPress={() =>
              router.push("/(protected)/fiscal-years")
            }
          />
        </View>
      </Card>

      <View className="gap-3">
        <Button
          variant="secondary"
          title="Refresh"
          onPress={load}
          loading={loading}
        />

        <Button
          variant="danger"
          title="Log out"
          onPress={logout}
        />
      </View>
    </Screen>
  );
}