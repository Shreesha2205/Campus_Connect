import { Stack, Redirect } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import React from "react";

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You can replace with splash screen later
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a0a12" },
        animation: "fade_from_bottom",
      }}
    />
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}