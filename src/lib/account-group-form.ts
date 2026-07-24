import type { AccountGroup, FieldErrors } from "@/types/domain";

export type AccountGroupFormValue = {
  account_group_type_id: string;
  parent_group_id: string | null;
  name: string;
};

export function accountGroupFormInitialValue(
  group?: AccountGroup,
): AccountGroupFormValue {
  return {
    account_group_type_id: group?.accountGroupTypeId ?? "",
    parent_group_id: group?.parentGroupId ?? null,
    name: group?.name ?? "",
  };
}

export function validateAccountGroupForm(value: AccountGroupFormValue): FieldErrors {
  const errors: FieldErrors = {};
  if (!value.account_group_type_id) {
    errors.account_group_type_id = "Select an account group type";
  }
  if (!value.name.trim()) errors.name = "Account group name is required";
  return errors;
}
