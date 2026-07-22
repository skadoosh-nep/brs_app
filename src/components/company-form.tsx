import { useState } from "react";

import type { CompanyInput } from "@/lib/services";
import { ApiError, type Company } from "@/types/domain";

import { Button, Field, Notice } from "./ui";

type CompanyFormProps = {
  company?: Company;
  submitLabel: string;
  onSubmit: (input: CompanyInput) => Promise<void>;
};

export function CompanyForm({
  company,
  submitLabel,
  onSubmit,
}: CompanyFormProps) {
  const [form, setForm] = useState<CompanyInput>({
    name: company?.name ?? "",
    address: company?.address ?? "",
    pan_no: company?.panNo ?? "",
    phone: company?.phone ?? "",
    email: company?.email ?? "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof CompanyInput) =>
    (value: string): void => {
      setForm((current) => ({
        ...current,
        [key]: value,
      }));
    };

  async function save() {
    const requiredFields = [
      "name",
      "pan_no",
      "phone",
      "email",
    ] as const;

    const missing = Object.fromEntries(
      requiredFields
        .filter((key) => !form[key]?.trim())
        .map((key) => [key, "Required"])
    ) as Record<string, string>;

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      missing.email = "Enter a valid email";
    }

    setFieldErrors(missing);

    if (Object.keys(missing).length > 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        pan_no: form.pan_no.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address?.trim() || null,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setFieldErrors(e.fieldErrors);
      } else {
        setError(
          e instanceof Error
            ? e.message
            : "Could not save company"
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
        label="Company name"
        value={form.name}
        onChangeText={set("name")}
        error={fieldErrors.name}
        autoCapitalize="words"
      />

      <Field
        label="Address (optional)"
        value={form.address ?? ""}
        onChangeText={set("address")}
      />

      <Field
        label="PAN number"
        value={form.pan_no}
        onChangeText={set("pan_no")}
        error={fieldErrors.pan_no}
      />

      <Field
        label="Phone"
        value={form.phone}
        onChangeText={set("phone")}
        error={fieldErrors.phone}
        keyboardType="phone-pad"
      />

      <Field
        label="Company email"
        value={form.email}
        onChangeText={set("email")}
        error={fieldErrors.email}
        keyboardType="email-address"
        autoComplete="email"
      />

      <Button
        title={submitLabel}
        onPress={save}
        loading={loading}
      />
    </>
  );
}