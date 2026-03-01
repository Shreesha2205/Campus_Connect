import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a12" },
          animation: "fade_from_bottom",
        }}
      />
    </AuthProvider>
  );
}