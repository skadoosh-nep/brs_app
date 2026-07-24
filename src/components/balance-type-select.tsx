import { Pressable, Text, View } from "react-native";

export function BalanceTypeSelect({
  value,
  onChange,
  error,
}: {
  value: "DR" | "CR" | "";
  onChange: (value: "DR" | "CR" | "") => void;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-muted">
        Opening balance type
      </Text>
      <View className="flex-row gap-2">
        {([
          { value: "DR", label: "Debit" },
          { value: "CR", label: "Credit" },
        ] as const).map((item) => (
          <Pressable
            key={item.value}
            onPress={() => onChange(value === item.value ? "" : item.value)}
            className={`min-h-12 flex-1 items-center justify-center rounded border ${
              value === item.value ? "border-primary bg-primary" : "border-line bg-white"
            }`}
          >
            <Text
              className={`font-semibold ${
                value === item.value ? "text-white" : "text-primary"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}
