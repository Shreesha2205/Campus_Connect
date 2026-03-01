import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Reusable info row for view mode
function InfoRow({ icon, label, value }) {
    const isEmpty = !value || !value.trim();
    return (
        <div className="profile-info-row">
            <div className="profile-info-icon">{icon}</div>
            <div className="profile-info-content">
                <div className="profile-info-label">{label}</div>
                <div className={`profile-info-value${isEmpty ? " empty" : ""}`}>
                    {isEmpty ? "Not set" : value}
                </div>
            </div>
        </div>
    );
}

function Profile() {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [image, setImage] = useState("");
    const [fileName, setFileName] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const fileInputRef = useRef(null);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setImage(reader.result);
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const res = await api.put("/auth/profile", { name, email, bio, department, year, profileImage: image });
            updateUser(res.data);
            showToast("Profile updated successfully ✅");
            setIsEditing(false);
        } catch (error) {
            showToast(error.response?.data?.message || "Update failed ❌", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => setIsEditing(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/profile");
                setName(res.data.name || "");
                setEmail(res.data.email || "");
                setBio(res.data.bio || "");
                setDepartment(res.data.department || "");
                setYear(res.data.year || "");
                setImage(res.data.profileImage || "");
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const displayName = name || user?.name || "Student";
    const initial = displayName.charAt(0).toUpperCase();

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12, flexDirection: "column" }}>
                <span className="spinner" style={{ width: 32, height: 32, borderTopColor: "var(--accent-purple)" }} />
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading profile…</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Page header with Edit / Cancel button */}
            <div className="profile-page-header">
                <span className="profile-page-title">My Profile</span>
                {isEditing ? (
                    <button className="btn-cancel-profile" onClick={handleCancel}>
                        ✕ Cancel
                    </button>
                ) : (
                    <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            {/* Hero — always visible */}
            <div className="profile-hero">
                <div className="profile-avatar-wrap">
                    {image ? (
                        <img className="profile-avatar-img" src={image} alt="Profile" />
                    ) : (
                        <div className="profile-avatar-placeholder">{initial}</div>
                    )}
                    {isEditing && (
                        <button
                            className="profile-avatar-edit-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Change photo"
                        >
                            📷
                        </button>
                    )}
                </div>

                <h1 className="profile-name">{displayName}</h1>
                <p className="profile-hero-email">{email || "—"}</p>
                <p className="profile-hero-dept">
                    {(department || year)
                        ? `${department || ""}${department && year ? "  ·  " : ""}${year ? `Year ${year}` : ""}`
                        : "No department set"}
                </p>
                {bio && <p className="profile-hero-bio">"{bio}"</p>}
            </div>

            {/* ── VIEW MODE ── */}
            {!isEditing && (
                <div className="profile-info-card">
                    <div className="profile-info-card-header">
                        <span>🪪</span> Profile Details
                    </div>
                    <InfoRow icon="👤" label="Full Name" value={name} />
                    <InfoRow icon="✉️" label="Email" value={email} />
                    <InfoRow icon="💬" label="Bio" value={bio} />
                    <InfoRow icon="🎓" label="Department" value={department} />
                    <InfoRow icon="📅" label="Year" value={year} />
                </div>
            )}

            {/* ── EDIT MODE ── */}
            {isEditing && (
                <div className="profile-card">
                    <div className="profile-card-title">
                        <span>✏️</span> Edit Profile
                    </div>

                    {/* Photo upload */}
                    <div className="profile-field">
                        <label>Profile Photo</label>
                        <div className="profile-photo-upload">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                                id="profile-photo-input"
                            />
                            <button id="profile-photo-btn" className="btn-upload" onClick={() => fileInputRef.current?.click()}>
                                📁 {image ? "Change Photo" : "Choose Photo"}
                            </button>
                            {fileName && <span className="upload-filename">📎 {fileName}</span>}
                            {!fileName && image && <span className="upload-filename">✅ Photo loaded</span>}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="profile-field">
                        <label>Full Name</label>
                        <input
                            id="profile-name"
                            className="profile-input"
                            placeholder="Your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                        />
                    </div>

                    {/* Email */}
                    <div className="profile-field">
                        <label>Email</label>
                        <input
                            id="profile-email"
                            className="profile-input"
                            type="email"
                            placeholder="you@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    {/* Bio */}
                    <div className="profile-field">
                        <label>Bio</label>
                        <input
                            id="profile-bio"
                            className="profile-input"
                            placeholder="Tell your campus about yourself…"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>

                    {/* Department */}
                    <div className="profile-field">
                        <label>Department</label>
                        <input
                            id="profile-department"
                            className="profile-input"
                            placeholder="e.g. Computer Science, Engineering…"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>

                    {/* Year */}
                    <div className="profile-field">
                        <label>Year</label>
                        <input
                            id="profile-year"
                            className="profile-input"
                            placeholder="e.g. 1, 2, 3, 4…"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        />
                    </div>

                    {/* Save */}
                    <button
                        id="profile-save-btn"
                        className="btn-save"
                        onClick={handleUpdate}
                        disabled={saving}
                        style={{ marginTop: 8 }}
                    >
                        {saving ? (
                            <>
                                <span className="spinner" style={{ marginRight: 8, width: 16, height: 16, display: "inline-block" }} />
                                Saving…
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            )}

            {/* Toast */}
            <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
                {toast.type === "error" ? "⚠️" : "✅"} {toast.message}
            </div>
        </div>
    );
}

export default Profile;