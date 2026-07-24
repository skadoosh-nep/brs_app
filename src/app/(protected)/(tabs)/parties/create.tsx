import { router } from "expo-router";
import { useEffect, useState } from "react";

import { PartyForm } from "@/components/party-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { nullablePartyValue, type PartyFormValue } from "@/lib/party-form";
import { companyService, partyService, partyTypeService } from "@/lib/services";
import type { PartyType } from "@/types/domain";

export default function CreatePartyScreen() {
  const [types, setTypes] = useState<PartyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    partyTypeService
      .list(true)
      .then(setTypes)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load party types"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function create(value: PartyFormValue) {
    const company = await companyService.current();
    const party = await partyService.create({
      company_id: company.id,
      party_type_id: value.party_type_id,
      name: value.name.trim(),
      phone: nullablePartyValue(value.phone),
      email: nullablePartyValue(value.email),
      address: nullablePartyValue(value.address),
      pan_no: nullablePartyValue(value.pan_no),
    });
    router.replace({
      pathname: "/(protected)/(tabs)/parties/[id]",
      params: { id: party.id },
    });
  }

  if (loading) return <Loading label="Loading party types…" />;

  return (
    <Screen>
      <Header title="Create party" subtitle="Add a client, vendor, or contractor." />
      {error ? (
        <Notice message={error} />
      ) : types.length ? (
        <Card>
          <PartyForm types={types} submitLabel="Create party" onSubmit={create} />
        </Card>
      ) : (
        <Notice message="No active party types are available. Backend setup is required." />
      )}
    </Screen>
  );
}
