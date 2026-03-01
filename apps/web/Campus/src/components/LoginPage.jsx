import { useState } from "react";

function LoginPage({ onLogin, onRegister }) {
    const [mode, setMode] = useState("login"); // "login" | "register"

    // Login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register state
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const switchMode = (m) => {
        setMode(m);
        setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError("Please fill in all fields."); return; }
        setLoading(true); setError("");
        try {
            await onLogin(email, password);
        } catch {
            setError("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!regName || !regEmail || !regPassword || !regConfirm) {
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
            await onRegister(regName, regEmail, regPassword);
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-blobs">
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
                <div className="bg-blob bg-blob-3" />
            </div>

            <div className="login-page">
                <div className="login-container">
                    <div className="login-card">
                        {/* Logo */}
                        <div className="login-logo">
                            <div className="login-logo-icon">🎓</div>
                            <span className="login-logo-text">CampusConnect</span>
                        </div>

                        {/* Tab switcher */}
                        <div style={tabSwitcherStyle}>
                            <button
                                type="button"
                                style={mode === "login" ? activeTabStyle : inactiveTabStyle}
                                onClick={() => switchMode("login")}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                style={mode === "register" ? activeTabStyle : inactiveTabStyle}
                                onClick={() => switchMode("register")}
                            >
                                Create Account
                            </button>
                        </div>

                        {/* ── LOGIN FORM ── */}
                        {mode === "login" && (
                            <>
                                <h1 className="login-heading">Welcome back</h1>
                                <p className="login-subheading">Sign in to your campus community</p>

                                <form onSubmit={handleLogin}>
                                    <div className="form-group">
                                        <label className="form-label">Email address</label>
                                        <input
                                            id="login-email"
                                            className="form-input"
                                            type="email"
                                            placeholder="you@university.edu"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input
                                            id="login-password"
                                            className="form-input"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                            autoComplete="current-password"
                                        />
                                    </div>

                                    {error && <ErrorBox message={error} />}

                                    <button id="login-submit" className="btn-primary" type="submit" disabled={loading}>
                                        {loading ? <><span className="spinner" style={{ marginRight: 8 }} />Signing in…</> : "Sign In →"}
                                    </button>
                                </form>

                                <p style={switchTextStyle}>
                                    Don't have an account?{" "}
                                    <button type="button" style={linkBtnStyle} onClick={() => switchMode("register")}>
                                        Create one
                                    </button>
                                </p>
                            </>
                        )}

                        {/* ── REGISTER FORM ── */}
                        {mode === "register" && (
                            <>
                                <h1 className="login-heading">Join CampusConnect</h1>
                                <p className="login-subheading">Create your student account</p>

                                <form onSubmit={handleRegister}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            id="reg-name"
                                            className="form-input"
                                            type="text"
                                            placeholder="Your full name"
                                            value={regName}
                                            onChange={(e) => { setRegName(e.target.value); setError(""); }}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email address</label>
                                        <input
                                            id="reg-email"
                                            className="form-input"
                                            type="email"
                                            placeholder="you@university.edu"
                                            value={regEmail}
                                            onChange={(e) => { setRegEmail(e.target.value); setError(""); }}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input
                                            id="reg-password"
                                            className="form-input"
                                            type="password"
                                            placeholder="Min. 6 characters"
                                            value={regPassword}
                                            onChange={(e) => { setRegPassword(e.target.value); setError(""); }}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <input
                                            id="reg-confirm"
                                            className="form-input"
                                            type="password"
                                            placeholder="Repeat your password"
                                            value={regConfirm}
                                            onChange={(e) => { setRegConfirm(e.target.value); setError(""); }}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    {error && <ErrorBox message={error} />}

                                    <button id="reg-submit" className="btn-primary" type="submit" disabled={loading}>
                                        {loading ? <><span className="spinner" style={{ marginRight: 8 }} />Creating account…</> : "Create Account →"}
                                    </button>
                                </form>

                                <p style={switchTextStyle}>
                                    Already have an account?{" "}
                                    <button type="button" style={linkBtnStyle} onClick={() => switchMode("login")}>
                                        Sign in
                                    </button>
                                </p>
                            </>
                        )}

                        <div className="login-divider"><span>Campus Social Platform</span></div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
                            Your campus credentials are securely encrypted.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function ErrorBox({ message }) {
    return (
        <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#fca5a5",
            marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px",
        }}>
            ⚠️ {message}
        </div>
    );
}

/* Inline styles for tab UI */
const tabSwitcherStyle = {
    display: "flex",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "24px",
    gap: "4px",
};
const baseTabStyle = {
    flex: 1, border: "none", borderRadius: "9px", padding: "9px 0",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    transition: "all 0.2s", fontFamily: "inherit",
};
const activeTabStyle = {
    ...baseTabStyle,
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(139,92,246,0.35)",
};
const inactiveTabStyle = {
    ...baseTabStyle,
    background: "transparent",
    color: "#94a3b8",
};
const switchTextStyle = {
    textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "16px",
};
const linkBtnStyle = {
    background: "none", border: "none", color: "#a78bfa", fontWeight: "600",
    cursor: "pointer", fontSize: "13px", fontFamily: "inherit", padding: 0,
};

export default LoginPage;
