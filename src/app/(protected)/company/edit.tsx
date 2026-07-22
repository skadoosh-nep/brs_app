import { router } from "expo-router";
import { useEffect, useState } from "react";

import { CompanyForm } from "@/components/company-form";
import {
    Card,
    Header,
    Loading,
    Notice,
    Screen,
} from "@/components/ui";
import { companyService } from "@/lib/services";
import type { Company } from "@/types/domain";

export default function EditCompanyScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompany() {
      try {
        const currentCompany = await companyService.current();
        setCompany(currentCompany);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Unable to load company"
        );
      }
    }

    void loadCompany();
  }, []);

  if (!company && !error) {
    return <Loading />;
  }

  return (
    <Screen>
      <Header title="Edit company" />

      {error ? (
        <Notice message={error} />
      ) : company ? (
        <Card>
          <CompanyForm
            company={company}
            submitLabel="Save changes"
            onSubmit={async (input) => {
              await companyService.update(input);
              router.back();
            }}
          />
        </Card>
      ) : null}
    </Screen>
  );
}