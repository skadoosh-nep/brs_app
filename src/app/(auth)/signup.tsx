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
import { ApiError } from "@/types/domain";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export default function SignupScreen() {
  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  const set =
    (key: keyof SignupForm) =>
    (value: string): void => {
      setForm((current) => ({
        ...current,
        [key]: value,
      }));
    };

  async function signup() {
    const next: Record<string, string> = {};

    if (!form.name.trim()) {
      next.name = "Required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Enter a valid email";
    }

    if (!form.password) {
      next.password = "Required";
    }

    if (form.password !== form.confirm_password) {
      next.confirm_password = "Passwords do not match";
    }

    setFields(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.signup({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });

      router.replace("/(auth)/verify-email");
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setFields(e.fieldErrors);
      } else {
        setError(
          e instanceof Error
            ? e.message
            : "Unable to create account"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="mx-auto w-full max-w-xl">
        <Brand />

        <Card>
          <Text className="text-3xl font-semibold text-ink">
            Create your account
          </Text>

          <Text className="mb-6 mt-2 text-muted">
            Start setting up your BRS workspace.
          </Text>

          {error ? <Notice message={error} /> : null}

          <Field
            label="Full name"
            value={form.name}
            onChangeText={set("name")}
            autoCapitalize="words"
            error={fields.name}
          />

          <Field
            label="Work email"
            value={form.email}
            onChangeText={set("email")}
            keyboardType="email-address"
            autoComplete="email"
            error={fields.email}
          />

          <Field
            label="Password"
            value={form.password}
            onChangeText={set("password")}
            secureTextEntry
            autoComplete="new-password"
            error={fields.password}
          />

          <Field
            label="Confirm password"
            value={form.confirm_password}
            onChangeText={set("confirm_password")}
            secureTextEntry
            autoComplete="new-password"
            error={fields.confirm_password}
          />

          <Button
            title="Sign up"
            onPress={signup}
            loading={loading}
          />

          <LinkButton
            title="Already have an account? Sign in"
            onPress={() => router.replace("/(auth)/login")}
          />
        </Card>
      </View>
    </Screen>
  );
}