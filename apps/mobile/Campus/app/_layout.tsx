import { Stack, Redirect } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";

function LoadingScreen() {
  const [seconds, setSeconds] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Animated dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Elapsed timer
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // Show hint after 5 s
    const hintTimer = setTimeout(() => setShowHint(true), 5000);

    // Bouncing dots loop
    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ])
      ).start();

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);

    return () => {
      clearInterval(timer);
      clearTimeout(hintTimer);
    };
  }, []);

  return (
    <View style={styles.loadingOverlay}>
      {/* Logo */}
      <View style={styles.logoIcon}>
        <Text style={styles.logoEmoji}>🎓</Text>
      </View>
      <Text style={styles.logoText}>CampusConnect</Text>

      {/* Spinner */}
      <ActivityIndicator
        size="large"
        color="#8b5cf6"
        style={{ marginTop: 36 }}
      />

      {/* Bouncing dots */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>

      {/* Wake-up message */}
      <Text style={styles.wakeTitle}>Waking up the server…</Text>
      <Text style={styles.wakeSubtitle}>
        This may take up to 30–60 seconds{"\n"}on first launch.
      </Text>

      {/* Elapsed time */}
      <View style={styles.timerBadge}>
        <Text style={styles.timerText}>⏱ {seconds}s</Text>
      </View>

      {/* Hint after 5 s */}
      {showHint && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            ☕ The free server is starting up — hang tight, it'll be ready
            shortly!
          </Text>
        </View>
      )}
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a12" },
          animation: "fade_from_bottom",
        }}
      >
        {/* Always declare all screens so Expo Router knows about them */}
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" />
      </Stack>

      {/*
        🔑 Auth gate — runs AFTER loading is done.
        Stack.Screen only sets options; it does NOT block navigation.
        A <Redirect> is the only reliable way to enforce auth in Expo Router.
      */}
      {!loading && !user && <Redirect href="/login" />}

      {loading && <LoadingScreen />}
    </>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0a0a12",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  // Logo
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  logoEmoji: { fontSize: 30 },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#c084fc",
    marginTop: 12,
    letterSpacing: -0.3,
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8b5cf6",
  },

  // Text
  wakeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e2e8f0",
    textAlign: "center",
    marginBottom: 8,
  },
  wakeSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },

  // Timer
  timerBadge: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    borderRadius: 20,
  },
  timerText: {
    color: "#a78bfa",
    fontSize: 13,
    fontWeight: "600",
  },

  // Hint
  hintBox: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  hintText: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default function Layout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}