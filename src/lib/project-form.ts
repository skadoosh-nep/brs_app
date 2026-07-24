import type { FieldErrors, Project } from "@/types/domain";

export type ProjectFormValue = {
  project_status_id: string;
  project_code: string;
  name: string;
  client_id: string | null;
  location: string;
  contract_amount: string;
  start_date: string;
  end_date: string;
  description: string;
};

export function projectFormInitialValue(project?: Project): ProjectFormValue {
  return {
    project_status_id: project?.projectStatusId ?? "",
    project_code: project?.projectCode ?? "",
    name: project?.name ?? "",
    client_id: project?.clientId ?? null,
    location: project?.location ?? "",
    contract_amount: project?.contractAmount ?? "0.00",
    start_date: project?.startDate ?? "",
    end_date: project?.endDate ?? "",
    description: project?.description ?? "",
  };
}

export function validateProjectForm(value: ProjectFormValue): FieldErrors {
  const errors: FieldErrors = {};
  if (!value.project_status_id) errors.project_status_id = "Select a project status";
  if (!value.project_code.trim()) errors.project_code = "Project code is required";
  if (!value.name.trim()) errors.name = "Project name is required";
  if (!/^\d+(\.\d+)?$/.test(value.contract_amount.trim())) {
    errors.contract_amount = "Enter a non-negative amount";
  }
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (value.start_date && !datePattern.test(value.start_date)) {
    errors.start_date = "Use YYYY-MM-DD";
  }
  if (value.end_date && !datePattern.test(value.end_date)) {
    errors.end_date = "Use YYYY-MM-DD";
  }
  if (
    !errors.start_date &&
    !errors.end_date &&
    value.start_date &&
    value.end_date &&
    value.start_date > value.end_date
  ) {
    errors.end_date = "End date must be on or after start date";
  }
  return errors;
}

export function nullable(value: string): string | null {
  return value.trim() || null;
}
