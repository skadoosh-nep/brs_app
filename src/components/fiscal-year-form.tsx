import { useState } from "react";

import { ApiError, type FiscalYear } from "@/types/domain";

import { Button, Field, Notice } from "./ui";

export type FiscalFormValue = {
  name: string;
  start_date: string;
  end_date: string;
};

type FiscalYearFormProps = {
  fiscalYear?: FiscalYear;
  submitLabel: string;
  onSubmit: (value: FiscalFormValue) => Promise<void>;
};

export function FiscalYearForm({
  fiscalYear,
  submitLabel,
  onSubmit,
}: FiscalYearFormProps) {
  const [value, setValue] = useState<FiscalFormValue>({
    name: fiscalYear?.name ?? "",
    start_date: fiscalYear?.startDate ?? "",
    end_date: fiscalYear?.endDate ?? "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});

  const set =
    (key: keyof FiscalFormValue) =>
    (text: string): void => {
      setValue((current) => ({
        ...current,
        [key]: text,
      }));
    };

  async function save() {
    const next: Record<string, string> = {};
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!value.name.trim()) {
      next.name = "Required";
    }

    if (!datePattern.test(value.start_date)) {
      next.start_date = "Use YYYY-MM-DD";
    }

    if (!datePattern.test(value.end_date)) {
      next.end_date = "Use YYYY-MM-DD";
    }

    if (
      !next.start_date &&
      !next.end_date &&
      value.start_date > value.end_date
    ) {
      next.end_date = "End date must be on or after start date";
    }

    setFields(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({
        name: value.name.trim(),
        start_date: value.start_date,
        end_date: value.end_date,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setFields(e.fieldErrors);
      } else {
        setError(
          e instanceof Error
            ? e.message
            : "Could not save fiscal year"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error ? <Notice message={error} /> : null}

      <Field
        label="Fiscal year name"
        value={value.name}
        onChangeText={set("name")}
        error={fields.name}
        placeholder="2082/83"
      />

      <Field
        label="Start date"
        value={value.start_date}
        onChangeText={set("start_date")}
        error={fields.start_date}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <Field
        label="End date"
        value={value.end_date}
        onChangeText={set("end_date")}
        error={fields.end_date}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <Button
        title={submitLabel}
        onPress={save}
        loading={loading}
      />
    </>
  );
}