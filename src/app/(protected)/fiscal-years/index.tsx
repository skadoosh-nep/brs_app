import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
    Button,
    Card,
    Empty,
    Header,
    Loading,
    Notice,
    Screen,
} from "@/components/ui";
import { fiscalYearService } from "@/lib/services";
import type { FiscalYear } from "@/types/domain";

export default function FiscalYearsScreen() {
  const [items, setItems] = useState<FiscalYear[]>([]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const result = await fiscalYearService.list({
        isActive: onlyActive ? true : undefined,
      });

      setItems(result.items);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load fiscal years"
      );
    } finally {
      setLoading(false);
    }
  }, [onlyActive]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading && items.length === 0) {
    return <Loading />;
  }

  return (
    <Screen>
      <Header
        title="Fiscal years"
        subtitle="Numbering and accounting periods are controlled by the backend."
      />

      {error ? <Notice message={error} /> : null}

      <View className="mb-4 flex-row gap-3">
        <View className="flex-1">
          <Button
            variant="secondary"
            title={onlyActive ? "Show all" : "Active only"}
            onPress={() =>
              setOnlyActive((current) => !current)
            }
          />
        </View>

        <View className="flex-1">
          <Button
            title="Create new"
            onPress={() =>
              router.push("/(protected)/fiscal-years/create")
            }
          />
        </View>
      </View>

      {items.length > 0 ? (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: "/(protected)/fiscal-years/[id]",
                params: {
                  id: item.id,
                },
              })
            }
          >
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-ink">
                  {item.name}
                </Text>

                {item.isActive ? (
                  <Text className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-success">
                    ACTIVE
                  </Text>
                ) : null}
              </View>

              <Text className="mt-2 text-muted">
                {item.startDate} — {item.endDate}
              </Text>
            </Card>
          </Pressable>
        ))
      ) : (
        <Empty
          title="No fiscal years"
          message="Create a fiscal year to establish the accounting period."
        />
      )}

      <View className="mt-5">
        <Button
          variant="secondary"
          title="Back to home"
          onPress={() =>
            router.replace("/(protected)/(tabs)")
          }
        />
      </View>
    </Screen>
  );
}
