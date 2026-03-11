import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Animated,
    LayoutAnimation,
    UIManager,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../src/context/AuthContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Login() {
    const { login, register, user } = useAuth();
    const [mode, setMode] = useState<"login" | "register">("login");

    // If already logged in, skip the login screen
    useEffect(() => {
        if (user) {
            router.replace("/(tabs)/feed");
        }
    }, [user]);

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Register fields
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const switchMode = (m: "login" | "register") => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMode(m);
        setError("");
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields."); return;
        }
        setLoading(true); setError("");
        try {
            await login(email.trim(), password);
            router.replace("/(tabs)/feed");
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        Keyboard.dismiss();
        if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirm) {
            setError("Please fill in all fields."); return;
        }
        if (regPassword !== regConfirm) {
            setError("Passwords do not match."); return;
        }
        if (regPassword.length < 6) {
            setError("Password must be at least 6 characters."); return;
        }
        setLoading(true); setError("");
        try {
            await register(regName.trim(), regEmail.trim(), regPassword);
            router.replace("/(tabs)/feed");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a12" />

            {/* Background blobs */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />
            <View style={[styles.blob, styles.blob3]} />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Logo */}
                        <View style={styles.logoRow}>
                            <View style={styles.logoIcon}>
                                <Text style={styles.logoEmoji}>🎓</Text>
                            </View>
                            <Text style={styles.logoText}>CampusConnect</Text>
                        </View>

                        {/* Tab switcher */}
                        <View style={styles.tabSwitcher}>
                            <TouchableOpacity
                                style={[styles.tab, mode === "login" && styles.tabActive]}
                                onPress={() => switchMode("login")}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, mode === "register" && styles.tabActive]}
                                onPress={() => switchMode("register")}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
                                    Create Account
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Heading */}
                        <Text style={styles.heading}>
                            {mode === "login" ? "Welcome back" : "Join CampusConnect"}
                        </Text>
                        <Text style={styles.subheading}>
                            {mode === "login"
                                ? "Sign in to connect with your campus community"
                                : "Create your student account to get started"}
                        </Text>

                        {/* Card */}
                        <View style={styles.card}>
                            {/* ── LOGIN FIELDS ── */}
                            {mode === "login" && (
                                <>
                                    <InputField
                                        label="Email address"
                                        icon="mail-outline"
                                        placeholder="you@university.edu"
                                        value={email}
                                        onChangeText={(t) => { setEmail(t); setError(""); }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <InputField
                                        label="Password"
                                        icon="lock-closed-outline"
                                        placeholder="••••••••"
                                        value={password}
                                        onChangeText={(t) => { setPassword(t); setError(""); }}
                                        secureTextEntry={!showPassword}
                                        rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                        onRightIconPress={() => setShowPassword(!showPassword)}
                                    />
                                </>
                            )}

                            {/* ── REGISTER FIELDS ── */}
                            {mode === "register" && (
                                <>
                                    <InputField
                                        label="Full Name"
                                        icon="person-outline"
                                        placeholder="Your full name"
                                        value={regName}
                                        onChangeText={(t) => { setRegName(t); setError(""); }}
                                        autoCapitalize="words"
                                    />
                                    <InputField
                                        label="Email address"
                                        icon="mail-outline"
                                        placeholder="you@university.edu"
                                        value={regEmail}
                                        onChangeText={(t) => { setRegEmail(t); setError(""); }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <InputField
                                        label="Password"
                                        icon="lock-closed-outline"
                                        placeholder="Min. 6 characters"
                                        value={regPassword}
                                        onChangeText={(t) => { setRegPassword(t); setError(""); }}
                                        secureTextEntry={!showRegPassword}
                                        rightIcon={showRegPassword ? "eye-off-outline" : "eye-outline"}
                                        onRightIconPress={() => setShowRegPassword(!showRegPassword)}
                                    />
                                    <InputField
                                        label="Confirm Password"
                                        icon="shield-checkmark-outline"
                                        placeholder="Repeat your password"
                                        value={regConfirm}
                                        onChangeText={(t) => { setRegConfirm(t); setError(""); }}
                                        secureTextEntry={!showConfirm}
                                        rightIcon={showConfirm ? "eye-off-outline" : "eye-outline"}
                                        onRightIconPress={() => setShowConfirm(!showConfirm)}
                                    />
                                </>
                            )}

                            {/* Error */}
                            {!!error && (
                                <View style={styles.errorBox}>
                                    <Ionicons name="warning-outline" size={14} color="#fca5a5" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            {/* Submit button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                                onPress={mode === "login" ? handleLogin : handleRegister}
                                activeOpacity={0.85}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitBtnText}>
                                        {mode === "login" ? "Sign In  →" : "Create Account  →"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Switch link */}
                        <View style={styles.switchRow}>
                            <Text style={styles.switchText}>
                                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            </Text>
                            <TouchableOpacity onPress={() => switchMode(mode === "login" ? "register" : "login")}>
                                <Text style={styles.switchLink}>
                                    {mode === "login" ? "Create one" : "Sign in"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Campus Social Platform</Text>
                            <View style={styles.dividerLine} />
                        </View>
                        <Text style={styles.footerText}>
                            Your campus credentials are securely encrypted.
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* ── Reusable input field ─────────────────────────────────────────────────── */
interface InputFieldProps {
    label: string;
    icon: string;
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    rightIcon?: string;
    onRightIconPress?: () => void;
}

function InputField({
    label, icon, placeholder, value, onChangeText,
    secureTextEntry, keyboardType, autoCapitalize,
    rightIcon, onRightIconPress,
}: InputFieldProps) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrap, focused && styles.inputFocused]}>
                <Ionicons name={icon as any} size={18} color={focused ? "#8b5cf6" : "#64748b"} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#64748b"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType ?? "default"}
                    autoCapitalize={autoCapitalize ?? "none"}
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.eyeBtn}>
                        <Ionicons name={rightIcon as any} size={18} color="#64748b" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0a0a12" },
    flex: { flex: 1 },
    blob: { position: "absolute", borderRadius: 999 },
    blob1: { width: 300, height: 300, backgroundColor: "rgba(139,92,246,0.18)", top: -80, left: -80 },
    blob2: { width: 240, height: 240, backgroundColor: "rgba(236,72,153,0.14)", bottom: -60, right: -60 },
    blob3: { width: 160, height: 160, backgroundColor: "rgba(59,130,246,0.1)", top: "45%", right: 20 },

    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 48,
        flexGrow: 1,
    },

    logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 12 },
    logoIcon: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: "#8b5cf6",
        alignItems: "center", justifyContent: "center",
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 8,
    },
    logoEmoji: { fontSize: 22 },
    logoText: { fontSize: 22, fontWeight: "800", color: "#c084fc", letterSpacing: -0.3 },

    // Tab switcher
    tabSwitcher: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 4,
        marginBottom: 22,
        gap: 4,
    },
    tab: {
        flex: 1, paddingVertical: 10, borderRadius: 9,
        alignItems: "center", justifyContent: "center",
    },
    tabActive: {
        backgroundColor: "#8b5cf6",
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 4,
    },
    tabText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
    tabTextActive: { color: "#fff" },

    heading: { fontSize: 28, fontWeight: "800", color: "#f1f5f9", marginBottom: 6, letterSpacing: -0.5 },
    subheading: { fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 20 },

    card: {
        backgroundColor: "rgba(19,19,31,0.95)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 22,
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
    },

    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 7 },
    inputWrap: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 12, paddingHorizontal: 14, height: 50,
    },
    inputFocused: { borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.08)" },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: "#f1f5f9", fontSize: 15, height: "100%" },
    eyeBtn: { padding: 4, marginLeft: 8 },

    errorBox: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1,
        borderColor: "rgba(239,68,68,0.25)", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12,
    },
    errorText: { color: "#fca5a5", fontSize: 13, flex: 1, lineHeight: 18 },

    submitBtn: {
        backgroundColor: "#8b5cf6", borderRadius: 12, height: 50,
        alignItems: "center", justifyContent: "center", marginTop: 4,
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },

    switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 18 },
    switchText: { color: "#64748b", fontSize: 13 },
    switchLink: { color: "#a78bfa", fontSize: 13, fontWeight: "700" },

    dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 10, gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
    dividerText: { fontSize: 12, color: "#64748b" },
    footerText: { fontSize: 12, color: "#475569", textAlign: "center", lineHeight: 18 },
});