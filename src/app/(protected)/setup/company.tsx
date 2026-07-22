import { router } from "expo-router";

import { CompanyForm } from "@/components/company-form";
import { Card, Header, Screen } from "@/components/ui";
import { companyService } from "@/lib/services";

export default function SetupCompanyScreen() {
  return (
    <Screen>
      <Header
        title="Set up your company"
        subtitle="Create the top-level workspace for your BRS records."
      />

      <Card>
        <CompanyForm
          submitLabel="Create company"
          onSubmit={async (input) => {
            await companyService.create(input);
            router.replace("/(protected)/setup/fiscal-year");
          }}
        />
      </Card>
    </Screen>
  );
}