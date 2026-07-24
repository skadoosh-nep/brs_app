import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AccountGroup } from "@/types/domain";

export function AccountGroupSelect({
  groups,
  value,
  onChange,
  error,
  label = "Account group",
  allowNone = false,
  noneLabel = "No parent group",
  excludedIds = new Set<string>(),
}: {
  groups: AccountGroup[];
  value: string | null;
  onChange: (id: string | null) => void;
  error?: string;
  label?: string;
  allowNone?: boolean;
  noneLabel?: string;
  excludedIds?: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = groups.find((group) => group.id === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups.filter(
      (group) =>
        !excludedIds.has(group.id) &&
        (!normalized || group.name.toLowerCase().includes(normalized)),
    );
  }, [excludedIds, groups, query]);
  const choose = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-muted">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`min-h-12 justify-center rounded border bg-white px-4 ${
          error ? "border-danger" : "border-line"
        }`}
      >
        <Text className={selected || allowNone ? "text-ink" : "text-muted"}>
          {selected?.name ?? (allowNone ? noneLabel : "Choose an account group")}
        </Text>
      </Pressable>
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-canvas">
          <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
            <Text className="text-xl font-semibold text-ink">Select account group</Text>
            <Pressable onPress={() => setOpen(false)} className="p-2">
              <Text className="font-semibold text-amber">Close</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="p-5">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search groups…"
              placeholderTextColor="#75777d"
              className="mb-4 min-h-12 rounded border border-line bg-white px-4 text-base text-ink"
            />
            {allowNone ? (
              <Option label={noneLabel} selected={!value} onPress={() => choose(null)} />
            ) : null}
            {filtered.map((group) => (
              <Option
                key={group.id}
                label={group.name}
                selected={group.id === value}
                onPress={() => choose(group.id)}
              />
            ))}
            {!filtered.length ? (
              <Text className="my-8 text-center text-muted">No account groups match.</Text>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-lg border p-4 ${
        selected ? "border-accent bg-amber-50" : "border-line bg-white"
      }`}
    >
      <Text className={selected ? "font-semibold text-primary" : "text-ink"}>{label}</Text>
    </Pressable>
  );
}
