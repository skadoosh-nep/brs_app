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

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  function submit() {
    const isValidEmail = /^\S+@\S+\.\S+$/.test(email);

    if (isValidEmail) {
      setNotice(
        "Password reset is awaiting backend support. No email was sent."
      );
    } else {
      setNotice("Enter a valid email address.");
    }
  }

  return (
    <Screen centered>
      <View className="mx-auto w-full max-w-xl">
        <Brand />

        <Card>
          <Text className="text-3xl font-semibold text-ink">
            Reset password
          </Text>

          <Text className="mb-6 mt-2 leading-6 text-muted">
            Enter your account email to check reset availability.
          </Text>

          {notice ? (
            <Notice
              tone="info"
              message={notice}
            />
          ) : null}

          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
          />

          <Button
            title="Check availability"
            onPress={submit}
          />

          <LinkButton
            title="Back to login"
            onPress={() => router.back()}
          />
        </Card>
      </View>
    </Screen>
  );
}