import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import api from "../../src/api/axios";
import { useAuth } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const MAX_CHARS = 500;

export default function NewPost() {
    const { user } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState("");
    const [posting, setPosting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [focused, setFocused] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const successScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const charsLeft = MAX_CHARS - content.length;
    const isOverLimit = charsLeft < 0;
    const canPost = content.trim().length > 0 && !isOverLimit && !posting;

    const handlePost = async () => {
        Keyboard.dismiss();
        if (!canPost) return;
        setPosting(true);
        try {
            await api.post("/posts", { content: content.trim() });

            Animated.spring(successScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 80,
                friction: 6,
            }).start();
            setSuccess(true);

            setTimeout(() => {
                setContent("");
                setSuccess(false);
                successScale.setValue(0);
                router.replace("/(tabs)/feed");
            }, 1200);
        } catch (e: any) {
            console.log(e);
        } finally {
            setPosting(false);
        }
    };

    const initial = user?.name?.charAt(0).toUpperCase() ?? "U";
    const firstName = user?.name?.split(" ")[0] ?? "there";

    return (
        <SafeAreaView style={styles.root} edges={["top"]}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a12" />

            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerBrand}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="pencil" size={14} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>New Post</Text>
                </View>
                <TouchableOpacity
                    style={[styles.shareBtn, !canPost && styles.shareBtnDisabled]}
                    onPress={handlePost}
                    disabled={!canPost}
                    activeOpacity={0.8}
                >
                    {posting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.shareBtnText}>Share</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* Composer card */}
                        <View style={[styles.composerCard, focused && styles.composerCardFocused]}>

                            {/* Author row inside the card */}
                            <View style={styles.authorRow}>
                                <View style={styles.avatar}>
                                    {user?.profileImage ? (
                                        <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                                    ) : (
                                        <Text style={styles.avatarInitial}>{initial}</Text>
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.authorName}>{user?.name || "Student"}</Text>
                                    <View style={styles.audiencePill}>
                                        <Ionicons name="globe-outline" size={10} color="#8b5cf6" />
                                        <Text style={styles.audienceText}>Everyone on campus</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={styles.cardDivider} />

                            {/* Text input */}
                            <TextInput
                                style={styles.textInput}
                                placeholder={`What's on your mind, ${firstName}?`}
                                placeholderTextColor="#334155"
                                value={content}
                                onChangeText={(t) => setContent(t.slice(0, MAX_CHARS + 20))}
                                multiline
                                autoFocus
                                textAlignVertical="top"
                                scrollEnabled={false}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                            />

                            {/* Card footer */}
                            <View style={styles.cardFooter}>
                                <Text style={styles.footerTip}>💡 Keep it relevant to your campus</Text>
                                <Text style={[
                                    styles.charCount,
                                    charsLeft < 50 && styles.charCountWarn,
                                    isOverLimit && styles.charCountOver,
                                ]}>
                                    {charsLeft}/{MAX_CHARS}
                                </Text>
                            </View>
                        </View>

                        {/* Tips outside card */}
                        <View style={styles.tipsRow}>
                            <View style={styles.tipChip}>
                                <Text style={styles.tipChipText}>📢 Announcements</Text>
                            </View>
                            <View style={styles.tipChip}>
                                <Text style={styles.tipChipText}>🎉 Events</Text>
                            </View>
                            <View style={styles.tipChip}>
                                <Text style={styles.tipChipText}>💬 Discussion</Text>
                            </View>
                        </View>

                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success overlay */}
            {success && (
                <Animated.View style={[styles.successOverlay, { transform: [{ scale: successScale }] }]}>
                    <Text style={styles.successIcon}>🎉</Text>
                    <Text style={styles.successText}>Posted!</Text>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0a0a12" },
    blob: { position: "absolute", borderRadius: 999 },
    blob1: { width: 300, height: 300, backgroundColor: "rgba(139,92,246,0.12)", top: -80, left: -80 },
    blob2: { width: 240, height: 240, backgroundColor: "rgba(236,72,153,0.08)", bottom: 40, right: -60 },

    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
        backgroundColor: "rgba(10,10,18,0.9)",
    },
    headerBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerIcon: {
        width: 30, height: 30, borderRadius: 8, backgroundColor: "#8b5cf6",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 17, fontWeight: "700", color: "#c084fc", letterSpacing: -0.2 },

    shareBtn: {
        backgroundColor: "#8b5cf6", borderRadius: 20,
        paddingHorizontal: 20, paddingVertical: 9,
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
    },
    shareBtnDisabled: { opacity: 0.3, shadowOpacity: 0 },
    shareBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.2 },

    scrollContent: { padding: 16, paddingTop: 20, flexGrow: 1 },

    // ── Composer card ─────────────────────────────────────────────────────────
    composerCard: {
        backgroundColor: "rgba(19,19,31,0.97)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    composerCardFocused: {
        borderColor: "rgba(139,92,246,0.45)",
        shadowColor: "#8b5cf6",
        shadowOpacity: 0.2,
    },

    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 14,
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: "#8b5cf6",
        alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "rgba(139,92,246,0.4)", overflow: "hidden",
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
    },
    avatarImg: { width: "100%", height: "100%" },
    avatarInitial: { color: "#fff", fontSize: 18, fontWeight: "700" },
    authorName: { color: "#f1f5f9", fontSize: 15, fontWeight: "700", marginBottom: 4 },
    audiencePill: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "rgba(139,92,246,0.1)",
        borderWidth: 1, borderColor: "rgba(139,92,246,0.25)",
        borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
        alignSelf: "flex-start",
    },
    audienceText: { color: "#8b5cf6", fontSize: 11, fontWeight: "600" },

    cardDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        marginBottom: 14,
    },

    textInput: {
        color: "#f1f5f9",
        fontSize: 16,
        lineHeight: 26,
        minHeight: 140,
        textAlignVertical: "top",
        letterSpacing: 0.1,
    },

    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.06)",
    },
    footerTip: { color: "#475569", fontSize: 12 },
    charCount: { fontSize: 12, fontWeight: "600", color: "#475569" },
    charCountWarn: { color: "#f59e0b" },
    charCountOver: { color: "#ef4444" },

    // ── Tip chips ─────────────────────────────────────────────────────────────
    tipsRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    tipChip: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tipChipText: { color: "#475569", fontSize: 12 },

    // ── Success ───────────────────────────────────────────────────────────────
    successOverlay: {
        position: "absolute",
        alignSelf: "center",
        top: "38%",
        backgroundColor: "rgba(16,185,129,0.15)",
        borderWidth: 1,
        borderColor: "rgba(16,185,129,0.4)",
        borderRadius: 20,
        paddingHorizontal: 36,
        paddingVertical: 24,
        alignItems: "center",
        gap: 8,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    successIcon: { fontSize: 42 },
    successText: { color: "#6ee7b7", fontSize: 18, fontWeight: "700" },
});
