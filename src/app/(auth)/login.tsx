import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  Brand,
  Button,
  Card,
  Field,
  LinkButton,
  Notice,
  Screen,
} from "@/components/ui";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/store/auth";
import { ApiError } from "@/types/domain";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  const setSession = useAuthStore((state) => state.setSession);
  const setAuthenticating = useAuthStore(
    (state) => state.setAuthenticating
  );
  const clear = useAuthStore((state) => state.clearSession);

  async function login() {
    const next: Record<string, string> = {};

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      next.email = "Enter a valid email";
    }

    if (!password) {
      next.password = "Enter your password";
    }

    setFields(next);

    if (Object.keys(next).length) {
      return;
    }

    setLoading(true);
    setError("");
    setAuthenticating();

    try {
      const session = await authService.login(email.trim(), password);

      setSession(session);
      router.replace("/(protected)/bootstrap");
    } catch (e) {
      clear();

      if (e instanceof ApiError) {
        console.log("ApiError:", e, e.fieldErrors);
        setError(e.message);
        setFields(e.fieldErrors);
      } else {
        setError(
          e instanceof Error ? e.message : "Unable to sign in"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen centered>
      <View className="mx-auto w-full max-w-xl">
        <Brand />

        <Card>
          <Text className="text-3xl font-semibold text-ink">
            Welcome back
          </Text>

          <Text className="mt-2 mb-6 text-muted">
            Access your BRS workspace.
          </Text>

          {error && <Notice message={error} />}

          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            error={fields.email}
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!show}
            autoComplete="current-password"
            error={fields.password}
          />

          <LinkButton
            title={show ? "Hide password" : "Show password"}
            onPress={() => setShow((prev) => !prev)}
          />

          <View className="mt-2">
            <Button
              title="Sign in"
              onPress={login}
              loading={loading}
            />
          </View>

          <LinkButton
            title="Forgot password?"
            onPress={() => router.push("/(auth)/reset-password")}
          />

          <View className="my-4 h-px bg-line" />

          <LinkButton
            title="Create an account"
            onPress={() => router.push("/(auth)/signup")}
          />
        </Card>
      </View>
    </Screen>
  );
}