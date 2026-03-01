import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [postToDelete, setPostToDelete] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch {
      showToast("Failed to load posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.post("/posts", { content });
      setContent("");
      await fetchPosts();
      showToast("Post shared! 🎉");
    } catch {
      showToast("Failed to post. Try again.", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handlePost();
    }
  };

  const handleDeletePrompt = (postId) => setPostToDelete(postId);

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await api.delete(`/posts/${postToDelete}`);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete));
      showToast("Post deleted");
    } catch {
      showToast("Failed to delete post", "error");
    } finally {
      setPostToDelete(null);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="feed-page">
      {/* Create Post */}
      <div className="create-post-card">
        <div className="create-post-header">
          <div className="post-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="you" />
            ) : (
              initial
            )}
          </div>
          <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
            Share something with your campus…
          </span>
        </div>

        <textarea
          id="post-input"
          className="post-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "student"}?`}
          rows={3}
        />

        <div className="create-post-actions">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            ⌨ Ctrl+Enter to post
          </span>
          <button
            id="post-btn"
            className="btn-post"
            onClick={handlePost}
            disabled={!content.trim() || posting}
          >
            {posting ? (
              <><span className="spinner" style={{ borderTopColor: "white", marginRight: 6, width: 14, height: 14 }} /> Posting…</>
            ) : (
              "Share Post ✦"
            )}
          </button>
        </div>
      </div>

      {/* Feed Label */}
      <div className="feed-label">Latest Posts</div>

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="spinner" style={{ borderTopColor: "var(--accent-purple)", width: 32, height: 32, margin: "0 auto", borderWidth: 3 }} />
          <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 14 }}>Loading posts…</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No posts yet</div>
          <div className="empty-state-sub">Be the first to share something with your campus!</div>
        </div>
      ) : (
        posts.map((post, index) => (
          <PostCard
            key={post._id}
            post={post}
            index={index}
            currentUserId={user?._id}
            onLike={async () => {
              await api.put(`/posts/${post._id}/like`);
              fetchPosts();
            }}
            onDelete={() => handleDeletePrompt(post._id)}
          />
        ))
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="modal-overlay" onClick={() => setPostToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap">
              <span style={{ fontSize: '24px' }}>🗑️</span>
            </div>
            <h3 className="modal-title">Delete Post?</h3>
            <p className="modal-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setPostToDelete(null)}>
                Cancel
              </button>
              <button className="modal-btn-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        {toast.type === "success" ? "✅" : "⚠️"} {toast.message}
      </div>
    </div>
  );
}

function PostCard({ post, index, currentUserId, onLike, onDelete }) {
  const initial = post.user?.name ? post.user.name.charAt(0).toUpperCase() : "?";
  const likeCount = post.likes?.length || 0;

  const isOwner =
    !!currentUserId &&
    (String(post.user?._id) === String(currentUserId) ||
      String(post.user) === String(currentUserId));

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="post-card" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="post-header">
        <div className="post-avatar">
          {post.user?.profileImage ? (
            <img src={post.user.profileImage} alt={post.user.name} />
          ) : (
            initial
          )}
        </div>
        <div className="post-user-info">
          <div className="post-user-name">{post.user?.name || "Unknown"}</div>
          <div className="post-user-sub">
            {post.user?.department
              ? `${post.user.department} • `
              : ""}
            {timeAgo(post.createdAt)}
          </div>
        </div>
        {isOwner && (
          <button
            className="btn-delete-post"
            onClick={onDelete}
            title="Delete post"
          >
            🗑️
          </button>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button
          className={`btn-like ${likeCount > 0 ? "liked" : ""}`}
          onClick={onLike}
        >
          ❤️ {likeCount > 0 ? likeCount : ""} {likeCount === 1 ? "Like" : likeCount > 1 ? "Likes" : "Like"}
        </button>
      </div>
    </div>
  );
}

export default Feed;