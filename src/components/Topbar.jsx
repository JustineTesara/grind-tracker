export default function Topbar({
  title,
  monthDisplay,
  onPrevMonth,
  onNextMonth,
  onLogActivity,
}) {
  return (
    <>
      <style>{`
        .grind-topbar {
          height: 60px;
          border-bottom: 1px solid #1c1c1f;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px 0 32px;
          position: sticky;
          top: 0;
          background-color: rgba(13,13,15,0.94);
          backdrop-filter: blur(12px);
          z-index: 40;
        }
        /* On mobile, add left padding for the hamburger button */
        @media (max-width: 768px) {
          .grind-topbar { padding-left: 64px; }
        }
        .grind-log-btn {
          display: flex; align-items: center; gap: 6px;
          background-color: #3dd68c; border: none;
          border-radius: 8px; padding: 8px 14px;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: #071a0e; cursor: pointer;
          transition: background-color 0.12s;
          white-space: nowrap;
        }
        .grind-log-btn:hover { background-color: #4feda6; }
        @media (max-width: 480px) {
          .grind-log-btn span.btn-label { display: none; }
          .grind-log-btn { padding: 8px 10px; border-radius: 8px; }
        }
      `}</style>

      <header className="grind-topbar">
        {/* Left — title + month nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            minWidth: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "15px",
              fontWeight: "600",
              color: "#f0ede8",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h2>

          {monthDisplay && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={onPrevMonth}
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#1c1c1f",
                  border: "1px solid #242428",
                  borderRadius: "6px",
                  color: "#8a8880",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.12s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#242428";
                  e.currentTarget.style.color = "#f0ede8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1c1c1f";
                  e.currentTarget.style.color = "#8a8880";
                }}
              >
                ‹
              </button>
              <span
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: "11px",
                  color: "#f0ede8",
                  minWidth: "100px",
                  textAlign: "center",
                  letterSpacing: "0.06em",
                }}
              >
                {monthDisplay}
              </span>
              <button
                onClick={onNextMonth}
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#1c1c1f",
                  border: "1px solid #242428",
                  borderRadius: "6px",
                  color: "#8a8880",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.12s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#242428";
                  e.currentTarget.style.color = "#f0ede8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1c1c1f";
                  e.currentTarget.style.color = "#8a8880";
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Right — Log Activity */}
        <button className="grind-log-btn" onClick={onLogActivity}>
          <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
          <span className="btn-label">Log Activity</span>
        </button>
      </header>
    </>
  );
}
