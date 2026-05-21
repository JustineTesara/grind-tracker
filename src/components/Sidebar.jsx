import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "weekly", icon: "📊", label: "Weekly Summary" },
  { id: "feedback", icon: "⚡", label: "Feedback" },
];

const ACTIVITY_KEY = [
  { color: "#3dd68c", label: "Run" },
  { color: "#3b9eff", label: "Cycling" },
  { color: "#ff6b35", label: "Gym" },
  { color: "#6b6b80", label: "Rest" },
];

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        padding: "10px 24px",
        fontSize: "13.5px",
        fontFamily: "DM Sans, sans-serif",
        fontWeight: active ? "500" : "400",
        color: active ? "#f0ede8" : "#555450",
        background: active ? "rgba(61,214,140,0.07)" : "transparent",
        borderLeft: active ? "2px solid #3dd68c" : "2px solid transparent",
        border: "none",
        borderLeft: active ? "2px solid #3dd68c" : "2px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "#8a8880";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "#555450";
      }}
    >
      <span style={{ fontSize: "15px", width: "18px", textAlign: "center" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/auth");
  }

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        backgroundColor: "#141416",
        borderRight: "1px solid #1c1c1f",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{ padding: "28px 24px 24px", borderBottom: "1px solid #1c1c1f" }}
      >
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "22px",
            fontWeight: "800",
            color: "#f0ede8",
            letterSpacing: "0.03em",
            margin: 0,
          }}
        >
          GRIND<span style={{ color: "#3dd68c" }}>.</span>
        </h1>
      </div>

      {/* Nav */}
      <nav
        style={{
          paddingTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <p
          style={{
            padding: "0 24px 10px",
            fontSize: "10px",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.12em",
            color: "#2e2e30",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activePage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      {/* Activity Key */}
      <div style={{ padding: "24px 24px 0" }}>
        <p
          style={{
            fontSize: "10px",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.12em",
            color: "#2e2e30",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Activity Key
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {ACTIVITY_KEY.map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "#555450",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid #1c1c1f",
          padding: "16px 24px",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontFamily: "DM Mono, monospace",
            color: "#2e2e30",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          Signed in as
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "#444440",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: "10px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user?.email}
        </p>
        <button
          onClick={handleSignOut}
          style={{
            fontSize: "12px",
            color: "#3a3a3e",
            fontFamily: "DM Mono, monospace",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff5032")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3e")}
        >
          → Sign out
        </button>
      </div>
    </aside>
  );
}
