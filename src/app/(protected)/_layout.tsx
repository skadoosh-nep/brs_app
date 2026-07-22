import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/store/auth";

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated"
  );

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}