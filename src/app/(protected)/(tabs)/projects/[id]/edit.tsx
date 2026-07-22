import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { ProjectForm } from "@/components/project-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { nullable, type ProjectFormValue } from "@/lib/project-form";
import { projectService, projectStatusService } from "@/lib/services";
import type { Project, ProjectStatus } from "@/types/domain";

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([projectService.get(id), projectStatusService.listActive()])
      .then(([item, statusItems]) => {
        setProject(item);
        setStatuses(statusItems);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load project"));
  }, [id]);

  async function update(value: ProjectFormValue) {
    await projectService.update(id, {
      project_status_id: value.project_status_id,
      project_code: value.project_code.trim(),
      name: value.name.trim(),
      location: nullable(value.location),
      contract_amount: value.contract_amount.trim(),
      start_date: nullable(value.start_date),
      end_date: nullable(value.end_date),
      description: nullable(value.description),
    });
    router.back();
  }

  if (!project && !error) return <Loading label="Loading project…" />;

  return (
    <Screen>
      <Header title="Edit project" subtitle={project?.projectCode} />
      {error ? (
        <Notice message={error} />
      ) : project ? (
        <Card>
          {project.clientId ? (
            <Notice tone="info" message="The existing client assignment is preserved and cannot be edited until Parties is implemented." />
          ) : null}
          <ProjectForm
            project={project}
            statuses={statuses}
            submitLabel="Save changes"
            onSubmit={update}
          />
        </Card>
      ) : null}
    </Screen>
  );
}
