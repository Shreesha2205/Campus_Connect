import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Animated,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import api from "../../src/api/axios";
import { useAuth } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

// ── small helper for empty value display ─────────────────────────────────────
const EMPTY = "—";

export default function Profile() {
    const { user, updateUser } = useAuth();

    // profile data
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [image, setImage] = useState<string | null>(null);

    // ui state
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ visible: false, message: "", success: true });

    const toastAnim = useRef(new Animated.Value(80)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    const showToast = (message: string, success = true) => {
        setToast({ visible: true, message, success });
        Animated.sequence([
            Animated.spring(toastAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
            Animated.delay(2500),
            Animated.timing(toastAnim, { toValue: 80, duration: 300, useNativeDriver: true }),
        ]).start(() => setToast((t) => ({ ...t, visible: false })));
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { showToast("Camera roll permission required", false); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.5,
        });
        if (!result.canceled) {
            setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleUpdate = async () => {
        Keyboard.dismiss();
        setSaving(true);
        try {
            const res = await api.put("/auth/profile", { name, email, bio, department, year, profileImage: image });
            updateUser(res.data); // Keep global context in sync!
            showToast("Profile updated successfully ✅", true);
            setIsEditing(false);
        } catch (error: any) {
            showToast(error?.response?.data?.message || "Update failed ❌", false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        Keyboard.dismiss();
        setIsEditing(false);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/profile");
                setName(res.data.name || "");
                setEmail(res.data.email || "");
                setBio(res.data.bio || "");
                setDepartment(res.data.department || "");
                setYear(res.data.year || "");
                setImage(res.data.profileImage || null);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const displayName = name || user?.name || "Student";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles.root} edges={["top"]}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a12" />

            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerBrand}>
                    <View style={styles.headerIcon}>
                        <Text style={{ fontSize: 15 }}>🎓</Text>
                    </View>
                    <Text style={styles.headerTitle}>My Profile</Text>
                </View>

                {!loading && (
                    isEditing ? (
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
                            <Ionicons name="close" size={16} color="#94a3b8" />
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)} activeOpacity={0.8}>
                            <Ionicons name="create-outline" size={16} color="#a78bfa" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    )
                )}
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#8b5cf6" />
                    <Text style={styles.loadingText}>Loading profile…</Text>
                </View>
            ) : (
                <Animated.ScrollView
                    style={{ opacity: fadeAnim }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>

                        {/* ── Hero card (always visible) ── */}
                        <View style={styles.heroCard}>
                            <View style={styles.heroGradientStrip} />
                            <View style={styles.avatarWrap}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.avatarImg} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarInitial}>{initial}</Text>
                                    </View>
                                )}
                                {isEditing && (
                                    <TouchableOpacity style={styles.avatarEditBtn} onPress={pickImage} activeOpacity={0.8}>
                                        <Ionicons name="camera" size={14} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Text style={styles.heroName}>{displayName}</Text>
                            <Text style={styles.heroEmail}>{email || EMPTY}</Text>
                            <Text style={styles.heroMeta}>
                                {(department || year)
                                    ? `${department || ""}${department && year ? "  ·  " : ""}${year ? `Year ${year}` : ""}`
                                    : "No department set"}
                            </Text>
                            {!!bio && <Text style={styles.heroBio}>"{bio}"</Text>}
                        </View>

                        {/* ── VIEW MODE ── */}
                        {!isEditing && (
                            <View style={styles.infoCard}>
                                <View style={styles.infoCardHeader}>
                                    <Ionicons name="person-circle-outline" size={18} color="#8b5cf6" />
                                    <Text style={styles.infoCardTitle}>Profile Details</Text>
                                </View>

                                <InfoRow icon="person-outline" label="Full Name" value={name} />
                                <InfoRow icon="mail-outline" label="Email" value={email} />
                                <InfoRow icon="chatbubble-ellipses-outline" label="Bio" value={bio} />
                                <InfoRow icon="school-outline" label="Department" value={department} />
                                <InfoRow icon="calendar-outline" label="Year" value={year} last />
                            </View>
                        )}

                        {/* ── EDIT MODE ── */}
                        {isEditing && (
                            <View style={styles.editCard}>
                                <View style={styles.editCardHeader}>
                                    <Ionicons name="create-outline" size={18} color="#8b5cf6" />
                                    <Text style={styles.editCardTitle}>Edit Profile</Text>
                                </View>

                                {/* Photo picker */}
                                <FieldBlock label="Profile Photo">
                                    <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.8}>
                                        <Ionicons name="image-outline" size={18} color="#8b5cf6" />
                                        <Text style={styles.uploadBtnText}>{image ? "Change Photo" : "Choose Photo"}</Text>
                                    </TouchableOpacity>
                                </FieldBlock>

                                <EditFieldRow icon="person-outline" label="Full Name" placeholder="Your full name"
                                    value={name} onChangeText={setName} autoCapitalize="words" />

                                <EditFieldRow icon="mail-outline" label="Email" placeholder="you@university.edu"
                                    value={email} onChangeText={setEmail} keyboardType="email-address" />

                                <EditFieldBlock label="Bio" icon="chatbubble-ellipses-outline"
                                    placeholder="Tell your campus about yourself…"
                                    value={bio} onChangeText={setBio} multiline />

                                <EditFieldRow icon="school-outline" label="Department" placeholder="e.g. Computer Science"
                                    value={department} onChangeText={setDepartment} />

                                <EditFieldRow icon="calendar-outline" label="Year" placeholder="e.g. 1, 2, 3, 4"
                                    value={year} onChangeText={setYear} keyboardType="numeric" />

                                {/* Save */}
                                <TouchableOpacity
                                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                                    onPress={handleUpdate}
                                    disabled={saving}
                                    activeOpacity={0.85}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                            <Text style={styles.saveBtnText}>Save Changes</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </Animated.ScrollView>
            )}

            {toast.visible && (
                <Animated.View
                    style={[
                        styles.toast,
                        toast.success ? styles.toastSuccess : styles.toastError,
                        { transform: [{ translateY: toastAnim }] },
                    ]}
                >
                    <Text style={styles.toastText}>{toast.message}</Text>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

// ── View-mode row ─────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, last }: {
    icon: string; label: string; value: string; last?: boolean;
}) {
    const isEmpty = !value || !value.trim();
    return (
        <View style={[infoStyles.row, !last && infoStyles.rowBorder]}>
            <View style={infoStyles.iconWrap}>
                <Ionicons name={icon as any} size={16} color="#64748b" />
            </View>
            <View style={infoStyles.content}>
                <Text style={infoStyles.label}>{label}</Text>
                <Text style={[infoStyles.value, isEmpty && infoStyles.valueEmpty]}>
                    {isEmpty ? "Not set" : value}
                </Text>
            </View>
        </View>
    );
}

// ── Edit-mode helpers ─────────────────────────────────────────────────────────
function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={editStyles.field}>
            <Text style={editStyles.label}>{label}</Text>
            {children}
        </View>
    );
}

function EditFieldRow({ icon, label, placeholder, value, onChangeText, keyboardType, autoCapitalize }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={editStyles.field}>
            <Text style={editStyles.label}>{label}</Text>
            <View style={[editStyles.inputRow, focused && editStyles.inputRowFocused]}>
                <Ionicons name={icon as any} size={16} color={focused ? "#8b5cf6" : "#64748b"} style={editStyles.icon} />
                <TextInput
                    style={editStyles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#475569"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType ?? "default"}
                    autoCapitalize={autoCapitalize ?? "none"}
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </View>
        </View>
    );
}

function EditFieldBlock({ icon, label, placeholder, value, onChangeText, multiline }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={editStyles.field}>
            <Text style={editStyles.label}>{label}</Text>
            <View style={[editStyles.textAreaWrap, focused && editStyles.inputRowFocused]}>
                <TextInput
                    style={editStyles.textArea}
                    placeholder={placeholder}
                    placeholderTextColor="#475569"
                    value={value}
                    onChangeText={onChangeText}
                    multiline={multiline}
                    numberOfLines={3}
                    textAlignVertical="top"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </View>
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0a0a12" },
    blob: { position: "absolute", borderRadius: 999 },
    blob1: { width: 280, height: 280, backgroundColor: "rgba(139,92,246,0.15)", top: -60, right: -60 },
    blob2: { width: 220, height: 220, backgroundColor: "rgba(236,72,153,0.1)", bottom: 100, left: -60 },

    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
        backgroundColor: "rgba(10,10,18,0.9)",
    },
    headerBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#8b5cf6", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 17, fontWeight: "700", color: "#c084fc", letterSpacing: -0.2 },

    editBtn: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "rgba(139,92,246,0.12)", borderWidth: 1,
        borderColor: "rgba(139,92,246,0.3)", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 7,
    },
    editBtnText: { color: "#a78bfa", fontSize: 13, fontWeight: "700" },
    cancelBtn: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 7,
    },
    cancelBtnText: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },

    scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48 },

    loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { color: "#64748b", fontSize: 14 },

    // Hero
    heroCard: {
        backgroundColor: "rgba(19,19,31,0.95)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)", borderRadius: 22,
        padding: 28, alignItems: "center", marginBottom: 18, overflow: "hidden",
        shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    },
    heroGradientStrip: {
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        backgroundColor: "#8b5cf6", borderTopLeftRadius: 22, borderTopRightRadius: 22,
    },
    avatarWrap: { position: "relative", marginBottom: 14, marginTop: 8 },
    avatarImg: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "rgba(139,92,246,0.5)" },
    avatarPlaceholder: {
        width: 88, height: 88, borderRadius: 44, backgroundColor: "#8b5cf6",
        alignItems: "center", justifyContent: "center",
        borderWidth: 3, borderColor: "rgba(139,92,246,0.5)",
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
    },
    avatarInitial: { color: "#fff", fontSize: 34, fontWeight: "800" },
    avatarEditBtn: {
        position: "absolute", bottom: 2, right: 2,
        width: 28, height: 28, borderRadius: 14, backgroundColor: "#8b5cf6",
        alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#13131f",
    },
    heroName: { color: "#f1f5f9", fontSize: 22, fontWeight: "800", letterSpacing: -0.3, marginBottom: 2 },
    heroEmail: { color: "#64748b", fontSize: 13, marginBottom: 4 },
    heroMeta: { color: "#8b5cf6", fontSize: 13, fontWeight: "500" },
    heroBio: { color: "#94a3b8", fontSize: 13, fontStyle: "italic", marginTop: 10, textAlign: "center", lineHeight: 20 },

    // Info card (view mode)
    infoCard: {
        backgroundColor: "rgba(19,19,31,0.95)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)", borderRadius: 22, overflow: "hidden",
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    infoCardHeader: {
        flexDirection: "row", alignItems: "center", gap: 8,
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
    },
    infoCardTitle: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },

    // Edit card (edit mode)
    editCard: {
        backgroundColor: "rgba(19,19,31,0.95)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)", borderRadius: 22, padding: 22,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    editCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
    editCardTitle: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },

    uploadBtn: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "rgba(139,92,246,0.1)", borderWidth: 1,
        borderColor: "rgba(139,92,246,0.3)", borderStyle: "dashed",
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, alignSelf: "flex-start",
    },
    uploadBtnText: { color: "#a78bfa", fontSize: 14, fontWeight: "600" },

    saveBtn: {
        backgroundColor: "#8b5cf6", borderRadius: 14, height: 52,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6,
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
    },
    saveBtnDisabled: { opacity: 0.55 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },

    toast: {
        position: "absolute", bottom: 24, left: 24, right: 24,
        borderRadius: 999, paddingHorizontal: 20, paddingVertical: 13, alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    },
    toastSuccess: { backgroundColor: "rgba(16,185,129,0.2)", borderWidth: 1, borderColor: "rgba(16,185,129,0.4)" },
    toastError: { backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.35)" },
    toastText: { color: "#f1f5f9", fontSize: 14, fontWeight: "600", textAlign: "center" },
});

// ── InfoRow styles ────────────────────────────────────────────────────────────
const infoStyles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, paddingVertical: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
    iconWrap: { width: 32, alignItems: "center", paddingTop: 2 },
    content: { flex: 1 },
    label: { fontSize: 11, fontWeight: "700", color: "#475569", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 3 },
    value: { fontSize: 15, color: "#f1f5f9", fontWeight: "500", lineHeight: 21 },
    valueEmpty: { color: "#334155", fontStyle: "italic", fontWeight: "400" },
});

// ── EditField styles ──────────────────────────────────────────────────────────
const editStyles = StyleSheet.create({
    field: { marginBottom: 16 },
    label: { fontSize: 11, fontWeight: "700", color: "#64748b", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)", borderRadius: 12, paddingHorizontal: 14, height: 48,
    },
    inputRowFocused: { borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.07)" },
    icon: { marginRight: 10 },
    input: { flex: 1, color: "#f1f5f9", fontSize: 14 },
    textAreaWrap: {
        backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)", borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 12, minHeight: 80,
    },
    textArea: { color: "#f1f5f9", fontSize: 14, lineHeight: 20, minHeight: 60 },
});
