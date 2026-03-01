import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import LoginPage from "./components/LoginPage";

function Navbar({ activePage, setActivePage, user, logout }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-icon">🎓</div>
        <span className="navbar-title">CampusConnect</span>
      </div>

      <div className="navbar-nav">
        <button
          className={`nav-btn ${activePage === "feed" ? "active" : ""}`}
          onClick={() => setActivePage("feed")}
        >
          <span>🏠</span> <span>Feed</span>
        </button>
        <button
          className={`nav-btn ${activePage === "profile" ? "active" : ""}`}
          onClick={() => setActivePage("profile")}
        >
          <span>👤</span> <span>Profile</span>
        </button>
      </div>

      <div className="navbar-user">
        <div className="navbar-avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="avatar" />
          ) : (
            initial
          )}
        </div>
        <span className="navbar-username">{user?.name || "Student"}</span>
        <button className="nav-btn-logout" onClick={logout}>
          <span>⏎</span> Logout
        </button>
      </div>
    </nav>
  );
}

function App() {
  const { user, login, register, logout } = useAuth();
  const [activePage, setActivePage] = useState("feed");

  if (!user) {
    return <LoginPage onLogin={login} onRegister={register} />;
  }

  return (
    <div className="app-layout">
      <div className="bg-blobs">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>

      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        logout={logout}
      />

      <main className="main-content">
        {activePage === "feed" && <Feed />}
        {activePage === "profile" && <Profile />}
      </main>
    </div>
  );
}

export default App;