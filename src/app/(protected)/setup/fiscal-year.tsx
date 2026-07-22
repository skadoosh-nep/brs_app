import { router } from "expo-router";

import { FiscalYearForm } from "@/components/fiscal-year-form";
import { Card, Header, Screen } from "@/components/ui";
import {
    companyService,
    fiscalYearService,
} from "@/lib/services";

export default function SetupFiscalYearScreen() {
  return (
    <Screen>
      <Header
        title="Create a fiscal year"
        subtitle="Every BRS transaction belongs to a backend-managed fiscal year."
      />

      <Card>
        <FiscalYearForm
          submitLabel="Create and continue"
          onSubmit={async (value) => {
            const company = await companyService.current();

            await fiscalYearService.create({
              company_id: company.id,
              ...value,
              is_active: true,
            });

            router.replace("/(protected)/home");
          }}
        />
      </Card>
    </Screen>
  );
}