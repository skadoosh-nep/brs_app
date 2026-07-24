import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { PartyForm } from "@/components/party-form";
import { Card, Header, Loading, Notice, Screen } from "@/components/ui";
import { nullablePartyValue, type PartyFormValue } from "@/lib/party-form";
import { partyService, partyTypeService } from "@/lib/services";
import type { Party, PartyType } from "@/types/domain";

export default function EditPartyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [party, setParty] = useState<Party | null>(null);
  const [activeTypes, setActiveTypes] = useState<PartyType[]>([]);
  const [allTypes, setAllTypes] = useState<PartyType[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([partyService.get(id), partyTypeService.list(true), partyTypeService.list()])
      .then(([item, active, all]) => {
        setParty(item);
        setActiveTypes(active);
        setAllTypes(all);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load party"),
      );
  }, [id]);

  const selectableTypes = useMemo(() => {
    if (!party || activeTypes.some((type) => type.id === party.partyTypeId)) return activeTypes;
    const currentType = allTypes.find((type) => type.id === party.partyTypeId);
    return currentType ? [currentType, ...activeTypes] : activeTypes;
  }, [activeTypes, allTypes, party]);

  async function update(value: PartyFormValue) {
    await partyService.update(id, {
      party_type_id: value.party_type_id,
      name: value.name.trim(),
      phone: nullablePartyValue(value.phone),
      email: nullablePartyValue(value.email),
      address: nullablePartyValue(value.address),
      pan_no: nullablePartyValue(value.pan_no),
    });
    router.back();
  }

  if (!party && !error) return <Loading label="Loading party…" />;

  return (
    <Screen>
      <Header title="Edit party" subtitle={party?.name} />
      {error ? (
        <Notice message={error} />
      ) : party ? (
        <Card>
          <PartyForm
            party={party}
            types={selectableTypes}
            submitLabel="Save changes"
            onSubmit={update}
          />
        </Card>
      ) : null}
    </Screen>
  );
}
