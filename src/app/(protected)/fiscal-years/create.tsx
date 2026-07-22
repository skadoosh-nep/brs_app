import { router } from "expo-router";

import { FiscalYearForm } from "@/components/fiscal-year-form";
import { Card, Header, Screen } from "@/components/ui";
import {
    companyService,
    fiscalYearService,
} from "@/lib/services";

export default function CreateFiscalYearScreen() {
  return (
    <Screen>
      <Header title="Create fiscal year" />

      <Card>
        <FiscalYearForm
          submitLabel="Create fiscal year"
          onSubmit={async (value) => {
            const company = await companyService.current();

            const fiscalYear =
              await fiscalYearService.create({
                company_id: company.id,
                ...value,
                is_active: false,
              });

            router.replace({
              pathname: "/(protected)/fiscal-years/[id]",
              params: {
                id: fiscalYear.id,
              },
            });
          }}
        />
      </Card>
    </Screen>
  );
}