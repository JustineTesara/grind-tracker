import { useState } from "react";
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
        padding: "11px 24px",
        fontSize: "13.5px",
        fontFamily: "DM Sans, sans-serif",
        fontWeight: active ? "500" : "400",
        color: active ? "#f0ede8" : "#555450",
        background: active ? "rgba(61,214,140,0.07)" : "transparent",
        borderLeft: active ? "2px solid #3dd68c" : "2px solid transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "#8a8880";
      }}
      onMouseLeave={(e) => {
        if (!active)
          e.currentTarget.style.color = active ? "#f0ede8" : "#555450";
      }}
    >
      <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/auth");
  }

  function handleNav(id) {
    onNavigate(id);
    setMobileOpen(false); // close on mobile after selecting
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        style={{
          padding: "24px 24px 20px",
          borderBottom: "1px solid #1c1c1f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "22px",
            fontWeight: "800",
            color: "#f0ede8",
            margin: 0,
          }}
        >
          GRIND<span style={{ color: "#3dd68c" }}>.</span>
        </h1>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#555450",
            fontSize: "22px",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 1,
          }}
          className="sidebar-close"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav
        style={{
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <p
          style={{
            padding: "0 24px 8px",
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
            onClick={() => handleNav(item.id)}
          />
        ))}
      </nav>

      {/* Activity Key */}
      <div style={{ padding: "20px 24px 0" }}>
        <p
          style={{
            fontSize: "10px",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.12em",
            color: "#2e2e30",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Activity Key
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
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
    </>
  );

  return (
    <>
      <style>{`
        /* ── Desktop sidebar ── */
        .grind-sidebar-desktop {
          width: 220px;
          min-height: 100vh;
          background-color: #141416;
          border-right: 1px solid #1c1c1f;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0;
          z-index: 50;
        }

        /* ── Mobile: hide desktop sidebar, show hamburger ── */
        @media (max-width: 768px) {
          .grind-sidebar-desktop { display: none !important; }
          .grind-hamburger { display: flex !important; }
        }

        /* ── Mobile drawer overlay ── */
        .grind-mobile-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 90;
        }
        .grind-mobile-overlay.open { display: block; }

        /* ── Mobile drawer panel ── */
        .grind-mobile-drawer {
          position: fixed;
          top: 0; left: 0;
          width: 260px; height: 100vh;
          background-color: #141416;
          border-right: 1px solid #1e1e22;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
        }
        .grind-mobile-drawer.open { transform: translateX(0); }

        /* Show close button inside mobile drawer */
        .grind-mobile-drawer .sidebar-close { display: flex !important; }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="grind-sidebar-desktop">{sidebarContent}</aside>

      {/* Mobile overlay — darkens background when drawer is open */}
      <div
        className={`grind-mobile-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`grind-mobile-drawer ${mobileOpen ? "open" : ""}`}>
        {sidebarContent}
      </div>

      {/* Hamburger button — only visible on mobile, sits in top-left */}
      <button
        className="grind-hamburger"
        onClick={() => setMobileOpen(true)}
        style={{
          display: "none",
          position: "fixed",
          top: "14px",
          left: "16px",
          zIndex: 80,
          background: "#141416",
          border: "1px solid #242428",
          borderRadius: "8px",
          width: "38px",
          height: "38px",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexDirection: "column",
          gap: "5px",
          padding: "0",
        }}
      >
        <span
          style={{
            width: "16px",
            height: "2px",
            backgroundColor: "#f0ede8",
            borderRadius: "2px",
            display: "block",
          }}
        />
        <span
          style={{
            width: "16px",
            height: "2px",
            backgroundColor: "#f0ede8",
            borderRadius: "2px",
            display: "block",
          }}
        />
        <span
          style={{
            width: "16px",
            height: "2px",
            backgroundColor: "#f0ede8",
            borderRadius: "2px",
            display: "block",
          }}
        />
      </button>
    </>
  );
}
