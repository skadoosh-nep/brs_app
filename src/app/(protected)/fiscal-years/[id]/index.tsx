import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
    Button,
    Card,
    Header,
    Loading,
    Notice,
    Screen,
} from "@/components/ui";
import { fiscalYearService } from "@/lib/services";
import type { FiscalYear } from "@/types/domain";

export default function FiscalYearDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [year, setYear] = useState<FiscalYear | null>(null);
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      const fiscalYear = await fiscalYearService.get(id);

      setYear(fiscalYear);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load fiscal year"
      );
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function activate() {
    if (!id) {
      return;
    }

    setActivating(true);
    setError("");

    try {
      const activatedFiscalYear =
        await fiscalYearService.activate(id);

      setYear(activatedFiscalYear);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to activate fiscal year"
      );
    } finally {
      setActivating(false);
    }
  }

  function confirmActivation() {
    Alert.alert(
      "Activate fiscal year?",
      "This changes the active accounting period on the backend.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Activate",
          onPress: () => {
            void activate();
          },
        },
      ]
    );
  }

  if (!year && !error) {
    return <Loading />;
  }

  return (
    <Screen>
      <Header title="Fiscal year detail" />

      {error ? <Notice message={error} /> : null}

      {year ? (
        <Card>
          <View className="flex-row justify-between">
            <Text className="text-2xl font-semibold text-ink">
              {year.name}
            </Text>

            {year.isActive ? (
              <Text className="text-sm font-bold text-success">
                ACTIVE
              </Text>
            ) : null}
          </View>

          <Text className="mt-4 text-muted">
            Start date
          </Text>

          <Text className="text-ink">
            {year.startDate}
          </Text>

          <Text className="mt-4 text-muted">
            End date
          </Text>

          <Text className="text-ink">
            {year.endDate}
          </Text>

          <View className="mt-6 gap-3">
            <Button
              title="Edit"
              onPress={() =>
                router.push({
                  pathname:
                    "/(protected)/fiscal-years/[id]/edit",
                  params: {
                    id,
                  },
                })
              }
            />

            {!year.isActive ? (
              <Button
                variant="secondary"
                title="Activate fiscal year"
                onPress={confirmActivation}
                loading={activating}
              />
            ) : null}

            <Button
              variant="secondary"
              title="Back to list"
              onPress={() => router.back()}
            />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}