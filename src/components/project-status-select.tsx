import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ProjectStatus } from "@/types/domain";

type Props = {
  statuses: ProjectStatus[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  allowAll?: boolean;
};

export function ProjectStatusSelect({
  statuses,
  value,
  onChange,
  error,
  allowAll = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = statuses.find((status) => status.id === value);

  function choose(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-muted">
        {allowAll ? "Filter by status" : "Project status"}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select project status"
        onPress={() => setOpen(true)}
        className={`min-h-12 justify-center rounded border bg-white px-4 ${
          error ? "border-danger" : "border-line"
        }`}
      >
        <Text className={selected || (allowAll && !value) ? "text-ink" : "text-muted"}>
          {selected?.name ?? (allowAll ? "All statuses" : "Choose a status")}
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
            <Text className="text-xl font-semibold text-ink">Select status</Text>
            <Pressable onPress={() => setOpen(false)} className="p-2">
              <Text className="font-semibold text-amber">Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="p-5">
            {allowAll ? (
              <StatusOption label="All statuses" selected={!value} onPress={() => choose("")} />
            ) : null}
            {statuses.map((status) => (
              <StatusOption
                key={status.id}
                label={status.name}
                selected={status.id === value}
                onPress={() => choose(status.id)}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function StatusOption({
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
      <Text className={`text-base ${selected ? "font-semibold text-primary" : "text-ink"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
