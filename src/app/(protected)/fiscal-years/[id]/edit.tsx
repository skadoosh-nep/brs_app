import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { FiscalYearForm } from "@/components/fiscal-year-form";
import {
    Card,
    Header,
    Loading,
    Notice,
    Screen,
} from "@/components/ui";
import { fiscalYearService } from "@/lib/services";
import type { FiscalYear } from "@/types/domain";

export default function EditFiscalYearScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [year, setYear] = useState<FiscalYear | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadFiscalYear() {
      try {
        const fiscalYear = await fiscalYearService.get(id);
        setYear(fiscalYear);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Unable to load fiscal year"
        );
      }
    }

    void loadFiscalYear();
  }, [id]);

  if (!year && !error) {
    return <Loading />;
  }

  return (
    <Screen>
      <Header title="Edit fiscal year" />

      {error ? (
        <Notice message={error} />
      ) : year ? (
        <Card>
          <FiscalYearForm
            fiscalYear={year}
            submitLabel="Save changes"
            onSubmit={async (value) => {
              await fiscalYearService.update(id, value);
              router.back();
            }}
          />
        </Card>
      ) : null}
    </Screen>
  );
}