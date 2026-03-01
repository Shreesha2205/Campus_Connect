import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Animated,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Modal,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../src/api/axios";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ── Time helper ───────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({
    item,
    onLike,
    onDeletePrompt,
    currentUserId,
}: {
    item: any;
    onLike: () => void;
    onDeletePrompt: () => void;
    currentUserId: string;
}) {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();
    }, []);

    const initial = item.user?.name?.charAt(0).toUpperCase() ?? "?";
    const likeCount = item.likes?.length ?? 0;
    const isOwner =
        !!currentUserId &&
        (String(item.user?._id) === String(currentUserId) ||
            String(item.user) === String(currentUserId));

    return (
        <Animated.View style={[styles.postCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.postHeader}>
                <View style={styles.postAvatarWrap}>
                    {item.user?.profileImage ? (
                        <Image source={{ uri: item.user.profileImage }} style={styles.postAvatar} />
                    ) : (
                        <View style={styles.postAvatarFallback}>
                            <Text style={styles.postAvatarText}>{initial}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.postMeta}>
                    <Text style={styles.postAuthor}>{item.user?.name ?? "Unknown"}</Text>
                    <Text style={styles.postTime}>
                        {item.user?.department ? `${item.user.department} · ` : ""}
                        {timeAgo(item.createdAt)}
                    </Text>
                </View>
                {/* Delete icon — only for the post owner */}
                {isOwner && (
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={onDeletePrompt}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.postContent}>{item.content}</Text>

            <View style={styles.postActions}>
                <TouchableOpacity
                    style={[styles.likeBtn, likeCount > 0 && styles.likeBtnActive]}
                    onPress={onLike}
                    activeOpacity={0.75}
                >
                    <Text style={styles.likeBtnIcon}>❤️</Text>
                    <Text style={[styles.likeBtnText, likeCount > 0 && styles.likeBtnTextActive]}>
                        {likeCount > 0 ? `${likeCount} ${likeCount === 1 ? "Like" : "Likes"}` : "Like"}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

// ── Feed Screen ───────────────────────────────────────────────────────────────
export default function Feed() {
    const { user, logout } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        try {
            const res = await api.get("/posts");
            setPosts(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await api.get("/posts");
            setPosts(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, []);

    const confirmDelete = async () => {
        if (!deletingPostId) return;
        try {
            await api.delete(`/posts/${deletingPostId}`);
            setPosts((prev) => prev.filter((p) => p._id !== deletingPostId));
        } catch (e) {
            console.log(e);
        } finally {
            setDeletingPostId(null);
        }
    };

    const initial = user?.name?.charAt(0).toUpperCase() ?? "U";

    const ListHeader = (
        <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>LATEST POSTS</Text>
            <View style={styles.sectionLine} />
        </View>
    );

    return (
        <SafeAreaView style={styles.root} edges={["top"]}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a12" />

            {/* Background blobs */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            {/* Navbar — logo + logout only (profile moved to bottom tab) */}
            <View style={styles.navbar}>
                <View style={styles.navBrand}>
                    <View style={styles.navIcon}>
                        <Text style={styles.navIconText}>🎓</Text>
                    </View>
                    <Text style={styles.navTitle}>CampusConnect</Text>
                </View>
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={async () => { await logout(); router.replace("/login"); }}
                    activeOpacity={0.75}
                >
                    <Ionicons name="log-out-outline" size={18} color="#f87171" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#8b5cf6" />
                        <Text style={styles.loadingText}>Loading posts…</Text>
                    </View>
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={ListHeader}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>📭</Text>
                                <Text style={styles.emptyTitle}>No posts yet</Text>
                                <Text style={styles.emptySub}>Be the first to share something!</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <PostCard
                                item={item}
                                currentUserId={user?._id ?? ""}
                                onLike={async () => {
                                    await api.put(`/posts/${item._id}/like`);
                                    fetchPosts();
                                }}
                                onDeletePrompt={() => setDeletingPostId(item._id)}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#8b5cf6"
                                colors={["#8b5cf6"]}
                            />
                        }
                    />
                )}
            </KeyboardAvoidingView>

            {/* Custom Delete Confirmation Modal */}
            <Modal transparent visible={!!deletingPostId} animationType="fade" statusBarTranslucent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="trash" size={24} color="#ef4444" />
                        </View>
                        <Text style={styles.modalTitle}>Delete Post?</Text>
                        <Text style={styles.modalText}>
                            This action cannot be undone.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalBtnCancel}
                                onPress={() => setDeletingPostId(null)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.modalBtnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtnDelete}
                                onPress={confirmDelete}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.modalBtnDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0a0a12" },
    blob: { position: "absolute", borderRadius: 999 },
    blob1: { width: 280, height: 280, backgroundColor: "rgba(139,92,246,0.14)", top: -80, left: -80 },
    blob2: { width: 220, height: 220, backgroundColor: "rgba(236,72,153,0.1)", bottom: 60, right: -60 },

    navbar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
        backgroundColor: "rgba(10,10,18,0.9)",
    },
    navBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
    navIcon: {
        width: 34, height: 34, borderRadius: 10, backgroundColor: "#8b5cf6",
        alignItems: "center", justifyContent: "center",
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 5,
    },
    navIconText: { fontSize: 17 },
    navTitle: { fontSize: 17, fontWeight: "700", color: "#c084fc", letterSpacing: -0.2 },
    logoutBtn: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
        backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
    },
    logoutText: { color: "#f87171", fontSize: 13, fontWeight: "600" },

    listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 16 },

    createCard: {
        backgroundColor: "rgba(19,19,31,0.95)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)", borderRadius: 18,
        padding: 18, marginBottom: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    createHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    userAvatarSmall: {
        width: 38, height: 38, borderRadius: 19, backgroundColor: "#8b5cf6",
        alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "rgba(139,92,246,0.3)", overflow: "hidden",
    },
    userAvatarSmallImg: { width: "100%", height: "100%", borderRadius: 19 },
    userAvatarSmallText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    createHint: { color: "#64748b", fontSize: 14, flex: 1 },
    textAreaWrap: {
        backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, minHeight: 80,
    },
    textAreaFocused: { borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.06)" },
    textArea: { color: "#f1f5f9", fontSize: 15, lineHeight: 22, minHeight: 60 },
    createActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
    createTip: { fontSize: 11, color: "#475569", flex: 1 },
    postBtn: {
        backgroundColor: "#8b5cf6", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9,
        shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
    },
    postBtnDisabled: { opacity: 0.45 },
    postBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

    sectionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
    sectionLabel: { fontSize: 11, fontWeight: "700", color: "#475569", letterSpacing: 1.2 },
    sectionLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)" },

    postCard: {
        backgroundColor: "rgba(19,19,31,0.95)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)", borderRadius: 18,
        padding: 18, marginBottom: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
    postAvatarWrap: { width: 42, height: 42, borderRadius: 21, overflow: "hidden", borderWidth: 2, borderColor: "rgba(139,92,246,0.3)" },
    postAvatar: { width: "100%", height: "100%" },
    postAvatarFallback: { width: "100%", height: "100%", backgroundColor: "#8b5cf6", alignItems: "center", justifyContent: "center" },
    postAvatarText: { color: "#fff", fontSize: 17, fontWeight: "700" },
    postMeta: { flex: 1 },
    postAuthor: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
    postTime: { color: "#64748b", fontSize: 12, marginTop: 1 },
    deleteBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: "rgba(239,68,68,0.08)",
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.18)",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "auto",
    },
    postContent: { color: "#94a3b8", fontSize: 15, lineHeight: 23, marginBottom: 14 },
    postActions: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", paddingTop: 12 },
    likeBtn: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
    },
    likeBtnActive: { backgroundColor: "rgba(236,72,153,0.1)", borderColor: "rgba(236,72,153,0.35)" },
    likeBtnIcon: { fontSize: 13 },
    likeBtnText: { color: "#94a3b8", fontSize: 13, fontWeight: "500" },
    likeBtnTextActive: { color: "#f472b6" },

    loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
    loadingText: { color: "#64748b", fontSize: 14 },
    emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
    emptyIcon: { fontSize: 44, marginBottom: 4 },
    emptyTitle: { color: "#94a3b8", fontSize: 18, fontWeight: "600" },
    emptySub: { color: "#64748b", fontSize: 14 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center", alignItems: "center", padding: 20,
    },
    modalContent: {
        width: "85%", maxWidth: 320, backgroundColor: "rgba(19,19,31,0.95)",
        borderRadius: 20, padding: 24, alignItems: "center",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
    },
    modalIconWrap: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(239,68,68,0.1)",
        alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    modalTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: "700", marginBottom: 8 },
    modalText: { color: "#94a3b8", fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 },
    modalActions: { flexDirection: "row", gap: 12, width: "100%" },
    modalBtnCancel: {
        flex: 1, paddingVertical: 12, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
        alignItems: "center", justifyContent: "center",
    },
    modalBtnCancelText: { color: "#cbd5e1", fontSize: 14, fontWeight: "600" },
    modalBtnDelete: {
        flex: 1, paddingVertical: 12, borderRadius: 12,
        backgroundColor: "#ef4444",
        alignItems: "center", justifyContent: "center",
        shadowColor: "#ef4444", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    modalBtnDeleteText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
