import type { FieldErrors, Party } from "@/types/domain";

export type PartyFormValue = {
  party_type_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pan_no: string;
};

export function partyFormInitialValue(party?: Party): PartyFormValue {
  return {
    party_type_id: party?.partyTypeId ?? "",
    name: party?.name ?? "",
    phone: party?.phone ?? "",
    email: party?.email ?? "",
    address: party?.address ?? "",
    pan_no: party?.panNo ?? "",
  };
}

export function validatePartyForm(value: PartyFormValue): FieldErrors {
  const errors: FieldErrors = {};
  if (!value.party_type_id) errors.party_type_id = "Select a party type";
  if (!value.name.trim()) errors.name = "Party name is required";
  if (value.email.trim() && !/^\S+@\S+\.\S+$/.test(value.email.trim())) {
    errors.email = "Enter a valid email";
  }
  return errors;
}

export function nullablePartyValue(value: string): string | null {
  return value.trim() || null;
}
