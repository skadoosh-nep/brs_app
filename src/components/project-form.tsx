import { useState } from "react";

import { Button, Field } from "@/components/ui";
import {
  projectFormInitialValue,
  validateProjectForm,
  type ProjectFormValue,
} from "@/lib/project-form";
import { ApiError, type Project, type ProjectStatus } from "@/types/domain";
import { useToastStore } from "@/store/toast";
import { ProjectStatusSelect } from "./project-status-select";
import { PartySelect } from "./party-select";

type Props = {
  project?: Project;
  statuses: ProjectStatus[];
  submitLabel: string;
  onSubmit: (value: ProjectFormValue) => Promise<void>;
};

export function ProjectForm({ project, statuses, submitLabel, onSubmit }: Props) {
  const [value, setValue] = useState(() => projectFormInitialValue(project));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const showError = useToastStore((state) => state.showError);

  const set = (key: keyof ProjectFormValue) => (text: string) => {
    setValue((current) => ({ ...current, [key]: text }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  async function submit() {
    const validation = validateProjectForm(value);
    setFieldErrors(validation);
    if (Object.keys(validation).length) return;

    setLoading(true);
    try {
      await onSubmit(value);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors((current) => ({ ...current, ...cause.fieldErrors }));
      } else {
        showError(cause instanceof Error ? cause.message : "Unable to save project");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ProjectStatusSelect
        statuses={statuses}
        value={value.project_status_id}
        onChange={set("project_status_id")}
        error={fieldErrors.project_status_id}
      />
      <Field
        label="Project code"
        value={value.project_code}
        onChangeText={set("project_code")}
        error={fieldErrors.project_code}
        autoCapitalize="characters"
      />
      <Field
        label="Project name"
        value={value.name}
        onChangeText={set("name")}
        error={fieldErrors.name}
        autoCapitalize="words"
      />
      <PartySelect
        value={value.client_id}
        onChange={(clientId) =>
          setValue((current) => ({ ...current, client_id: clientId }))
        }
      />
      <Field
        label="Location (optional)"
        value={value.location}
        onChangeText={set("location")}
        error={fieldErrors.location}
        autoCapitalize="words"
      />
      <Field
        label="Contract amount"
        value={value.contract_amount}
        onChangeText={set("contract_amount")}
        error={fieldErrors.contract_amount}
        keyboardType="decimal-pad"
        hint="Displayed as Nepalese rupees"
      />
      <Field
        label="Start date (optional)"
        value={value.start_date}
        onChangeText={set("start_date")}
        error={fieldErrors.start_date}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
      <Field
        label="End date (optional)"
        value={value.end_date}
        onChangeText={set("end_date")}
        error={fieldErrors.end_date}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
      <Field
        label="Description (optional)"
        value={value.description}
        onChangeText={set("description")}
        error={fieldErrors.description}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Button title={submitLabel} onPress={submit} loading={loading} />
    </>
  );
}
