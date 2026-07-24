import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AccountGroupType } from "@/types/domain";

export function AccountGroupTypeSelect({
  types,
  value,
  onChange,
  error,
  allowAll = false,
}: {
  types: AccountGroupType[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  allowAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = types.find((type) => type.id === value);
  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
  };
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-muted">
        {allowAll ? "Filter by group type" : "Account group type"}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`min-h-12 justify-center rounded border bg-white px-4 ${
          error ? "border-danger" : "border-line"
        }`}
      >
        <Text className={selected || allowAll ? "text-ink" : "text-muted"}>
          {selected?.name ?? (allowAll ? "All group types" : "Choose a group type")}
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
            <Text className="text-xl font-semibold text-ink">Select group type</Text>
            <Pressable onPress={() => setOpen(false)} className="p-2">
              <Text className="font-semibold text-amber">Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="p-5">
            {allowAll ? (
              <Option label="All group types" selected={!value} onPress={() => choose("")} />
            ) : null}
            {types.map((type) => (
              <Option
                key={type.id}
                label={type.name}
                selected={type.id === value}
                onPress={() => choose(type.id)}
              />
            ))}
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
