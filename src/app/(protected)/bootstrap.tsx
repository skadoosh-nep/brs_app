import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
    Button,
    Loading,
    Notice,
    Screen,
} from "@/components/ui";
import {
    companyService,
    fiscalYearService,
} from "@/lib/services";
import { ApiError } from "@/types/domain";

export default function BootstrapScreen() {
  const [error, setError] = useState("");

  async function load() {
    setError("");

    try {
      await companyService.current();
    } catch (e) {
      if (
        e instanceof ApiError &&
        (e.status === 404 || e.status === 400)
      ) {
        router.replace("/(protected)/setup/company");
        return;
      }

      setError(
        e instanceof Error
          ? e.message
          : "Unable to load company"
      );

      return;
    }

    try {
      const years = await fiscalYearService.list({
        isActive: true,
      });

      if (years.items.length === 0) {
        router.replace("/(protected)/setup/fiscal-year");
        return;
      }

      router.replace("/(protected)/(tabs)");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load fiscal year"
      );
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!error) {
    return <Loading label="Preparing your workspace…" />;
  }

  return (
    <Screen centered>
      <Notice message={error} />

      <Button
        title="Try again"
        onPress={load}
      />
    </Screen>
  );
}
