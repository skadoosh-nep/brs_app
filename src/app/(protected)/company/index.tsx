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
import { companyService } from "@/lib/services";
import type { Company } from "@/types/domain";

export default function CompanyScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const currentCompany = await companyService.current();

      setCompany(currentCompany);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load company"
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (!company && !error) {
    return <Loading />;
  }

  const details = company
    ? [
        ["PAN", company.panNo],
        ["Phone", company.phone],
        ["Email", company.email],
        ["Address", company.address ?? "—"],
      ]
    : [];

  return (
    <Screen>
      <Header
        title="Current company"
        subtitle="The active tenant for this BRS account."
      />

      {error ? <Notice message={error} /> : null}

      {company ? (
        <Card>
          <Text className="text-2xl font-semibold text-ink">
            {company.name}
          </Text>

          {details.map(([label, value]) => (
            <View
              key={label}
              className="mt-4"
            >
              <Text className="text-xs font-bold uppercase text-muted">
                {label}
              </Text>

              <Text className="mt-1 text-ink">
                {value}
              </Text>
            </View>
          ))}

          <View className="mt-6 gap-3">
            <Button
              title="Edit company"
              onPress={() =>
                router.push("/(protected)/company/edit")
              }
            />

            <Button
              variant="secondary"
              title="Back to home"
              onPress={() => router.back()}
            />
          </View>
        </Card>
      ) : (
        <Button
          title="Retry"
          onPress={load}
        />
      )}
    </Screen>
  );
}