import { router } from "expo-router";
import { useEffect, useState } from "react";

import { ProjectForm } from "@/components/project-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { nullable, type ProjectFormValue } from "@/lib/project-form";
import { companyService, projectService, projectStatusService } from "@/lib/services";
import type { ProjectStatus } from "@/types/domain";

export default function CreateProjectScreen() {
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectStatusService.listActive()
      .then(setStatuses)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load statuses"))
      .finally(() => setLoading(false));
  }, []);

  async function create(value: ProjectFormValue) {
    const company = await companyService.current();
    const project = await projectService.create({
      company_id: company.id,
      project_status_id: value.project_status_id,
      project_code: value.project_code.trim(),
      name: value.name.trim(),
      client_id: null,
      location: nullable(value.location),
      contract_amount: value.contract_amount.trim(),
      start_date: nullable(value.start_date),
      end_date: nullable(value.end_date),
      description: nullable(value.description),
    });
    router.replace({
      pathname: "/(protected)/(tabs)/projects/[id]",
      params: { id: project.id },
    });
  }

  if (loading) return <Loading label="Loading project statuses…" />;

  return (
    <Screen>
      <Header title="Create project" subtitle="Add a construction job or contract." />
      {error ? (
        <Notice message={error} />
      ) : statuses.length ? (
        <Card>
          <ProjectForm statuses={statuses} submitLabel="Create project" onSubmit={create} />
        </Card>
      ) : (
        <Notice message="No active project statuses are available. Backend setup is required." />
      )}
    </Screen>
  );
}
