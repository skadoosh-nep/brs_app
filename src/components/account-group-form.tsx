import { useState } from "react";

import { AccountGroupSelect } from "@/components/account-group-select";
import { AccountGroupTypeSelect } from "@/components/account-group-type-select";
import { Button, Field } from "@/components/ui";
import {
  accountGroupFormInitialValue,
  validateAccountGroupForm,
  type AccountGroupFormValue,
} from "@/lib/account-group-form";
import { useToastStore } from "@/store/toast";
import { ApiError, type AccountGroup, type AccountGroupType } from "@/types/domain";

export function AccountGroupForm({
  group,
  types,
  parentGroups,
  excludedParentIds,
  submitLabel,
  onSubmit,
}: {
  group?: AccountGroup;
  types: AccountGroupType[];
  parentGroups: AccountGroup[];
  excludedParentIds?: Set<string>;
  submitLabel: string;
  onSubmit: (value: AccountGroupFormValue) => Promise<void>;
}) {
  const [value, setValue] = useState(() => accountGroupFormInitialValue(group));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const showError = useToastStore((state) => state.showError);

  async function submit() {
    const validation = validateAccountGroupForm(value);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setLoading(true);
    try {
      await onSubmit(value);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setErrors((current) => ({ ...current, ...cause.fieldErrors }));
      } else {
        showError(cause instanceof Error ? cause.message : "Unable to save account group");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AccountGroupTypeSelect
        types={types}
        value={value.account_group_type_id}
        onChange={(id) => {
          setValue((current) => ({ ...current, account_group_type_id: id }));
          setErrors((current) => ({ ...current, account_group_type_id: "" }));
        }}
        error={errors.account_group_type_id}
      />
      <AccountGroupSelect
        groups={parentGroups}
        value={value.parent_group_id}
        onChange={(id) => setValue((current) => ({ ...current, parent_group_id: id }))}
        label="Parent group (optional)"
        allowNone
        excludedIds={excludedParentIds}
      />
      <Field
        label="Account group name"
        value={value.name}
        onChangeText={(name) => {
          setValue((current) => ({ ...current, name }));
          setErrors((current) => ({ ...current, name: "" }));
        }}
        error={errors.name}
        autoCapitalize="words"
      />
      <Button title={submitLabel} onPress={submit} loading={loading} />
    </>
  );
}
