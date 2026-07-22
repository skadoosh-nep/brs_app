import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  centered?: boolean;
};

export function Screen({
  children,
  centered = false,
}: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={`grow px-5 py-6 ${
            centered ? "justify-center" : ""
          }`}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Brand() {
  return (
    <View className="mb-8 items-center">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-lg bg-primary">
        <Text className="text-2xl font-bold text-white">B</Text>
      </View>

      <Text className="text-3xl font-bold tracking-tight text-primary">
        BRS
      </Text>

      <Text className="mt-1 text-sm text-muted">
        Construction and accounting, in control.
      </Text>
    </View>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function Header({
  title,
  subtitle,
  action,
}: HeaderProps) {
  return (
    <View className="mb-6 flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text className="text-2xl font-semibold text-ink">
          {title}
        </Text>

        {subtitle ? (
          <Text className="mt-1 text-sm leading-5 text-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action}
    </View>
  );
}

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <View
      className={`rounded-lg border border-line bg-white p-5 ${className}`}
    >
      {children}
    </View>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function Field({
  label,
  error,
  hint,
  ...props
}: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-muted">
        {label}
      </Text>

      <TextInput
        className={`min-h-12 rounded border bg-white px-4 py-3 text-base text-ink ${
          error ? "border-danger" : "border-line"
        }`}
        placeholderTextColor="#75777d"
        autoCapitalize="none"
        {...props}
      />

      {error ? (
        <Text className="mt-1 text-xs text-danger">
          {error}
        </Text>
      ) : hint ? (
        <Text className="mt-1 text-xs text-muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const containerClasses =
    variant === "primary"
      ? "border-primary bg-primary"
      : variant === "danger"
        ? "border-danger bg-white"
        : "border-line bg-white";

  const textClasses =
    variant === "primary"
      ? "text-white"
      : variant === "danger"
        ? "text-danger"
        : "text-primary";

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded border px-4 ${containerClasses} ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "white" : "#091426"}
        />
      ) : (
        <Text className={`text-base font-semibold ${textClasses}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

type LinkButtonProps = {
  title: string;
  onPress: () => void;
};

export function LinkButton({
  title,
  onPress,
}: LinkButtonProps) {
  return (
    <Pressable onPress={onPress} className="p-2">
      <Text className="text-center font-semibold text-amber">
        {title}
      </Text>
    </Pressable>
  );
}

type NoticeProps = {
  message: string;
  tone?: "error" | "info" | "success";
};

export function Notice({
  message,
  tone = "error",
}: NoticeProps) {
  const containerClasses =
    tone === "error"
      ? "border-red-200 bg-red-50"
      : tone === "success"
        ? "border-green-200 bg-green-50"
        : "border-blue-200 bg-blue-50";

  const textClasses =
    tone === "error"
      ? "text-danger"
      : tone === "success"
        ? "text-success"
        : "text-primary";

  return (
    <View className={`mb-4 rounded border p-3 ${containerClasses}`}>
      <Text className={`text-sm ${textClasses}`}>
        {message}
      </Text>
    </View>
  );
}

type LoadingProps = {
  label?: string;
};

export function Loading({
  label = "Loading…",
}: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator color="#091426" />

      <Text className="mt-3 text-muted">
        {label}
      </Text>
    </View>
  );
}

type EmptyProps = {
  title: string;
  message: string;
};

export function Empty({
  title,
  message,
}: EmptyProps) {
  return (
    <Card>
      <Text className="text-lg font-semibold text-ink">
        {title}
      </Text>

      <Text className="mt-2 leading-5 text-muted">
        {message}
      </Text>
    </Card>
  );
}