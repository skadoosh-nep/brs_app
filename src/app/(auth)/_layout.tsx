import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/store/auth";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated"
  );

  if (isAuthenticated) {
    return <Redirect href="/(protected)/bootstrap" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}