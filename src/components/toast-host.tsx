import { useEffect, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToastStore } from "@/store/toast";

export function ToastHost() {
  const message = useToastStore((state) => state.message);
  const sequence = useToastStore((state) => state.sequence);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-20));

  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    translateY.setValue(-20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [message, opacity, sequence, translateY]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: insets.top + 10,
        zIndex: 9999,
        elevation: 20,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        accessibilityRole="alert"
        accessibilityLabel={message}
        className="flex-row items-start rounded-lg border border-red-200 bg-red-50 py-4 pl-4 pr-2 shadow-lg"
      >
        <Text className="flex-1 py-1 text-base font-medium text-danger">{message}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close error message"
          hitSlop={10}
          onPress={hide}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Text className="text-2xl leading-7 text-red-700">×</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
