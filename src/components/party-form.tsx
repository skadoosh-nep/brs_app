import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { partyFormInitialValue, validatePartyForm, type PartyFormValue } from "@/lib/party-form";
import { useToastStore } from "@/store/toast";
import { ApiError, type Party, type PartyType } from "@/types/domain";
import { PartyTypeSelect } from "./party-type-select";

export function PartyForm({ party, types, submitLabel, onSubmit }: {
  party?: Party;
  types: PartyType[];
  submitLabel: string;
  onSubmit: (value: PartyFormValue) => Promise<void>;
}) {
  const [value, setValue] = useState(() => partyFormInitialValue(party));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const showError = useToastStore((state) => state.showError);
  const set = (key: keyof PartyFormValue) => (text: string) => { setValue((current) => ({ ...current, [key]: text })); setErrors((current) => ({ ...current, [key]: "" })); };
  async function submit() {
    const validation = validatePartyForm(value); setErrors(validation); if (Object.keys(validation).length) return;
    setLoading(true);
    try { await onSubmit(value); }
    catch (cause) { if (cause instanceof ApiError) setErrors((current) => ({ ...current, ...cause.fieldErrors })); else showError(cause instanceof Error ? cause.message : "Unable to save party"); }
    finally { setLoading(false); }
  }
  return <>
    <PartyTypeSelect types={types} value={value.party_type_id} onChange={set("party_type_id")} error={errors.party_type_id} />
    <Field label="Party name" value={value.name} onChangeText={set("name")} error={errors.name} autoCapitalize="words" />
    <Field label="Phone (optional)" value={value.phone} onChangeText={set("phone")} error={errors.phone} keyboardType="phone-pad" />
    <Field label="Email (optional)" value={value.email} onChangeText={set("email")} error={errors.email} keyboardType="email-address" />
    <Field label="Address (optional)" value={value.address} onChangeText={set("address")} error={errors.address} autoCapitalize="words" />
    <Field label="PAN number (optional)" value={value.pan_no} onChangeText={set("pan_no")} error={errors.pan_no} />
    <Button title={submitLabel} onPress={submit} loading={loading} />
  </>;
}
