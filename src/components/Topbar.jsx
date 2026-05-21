export default function Topbar({
  title,
  monthDisplay,
  onPrevMonth,
  onNextMonth,
  onLogActivity,
}) {
  return (
    <header
      style={{
        height: "60px",
        borderBottom: "1px solid #1c1c1f",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(13,13,15,0.92)",
        backdropFilter: "blur(12px)",
        zIndex: 40,
      }}
    >
      {/* Left — title + month nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "15px",
            fontWeight: "600",
            color: "#f0ede8",
            margin: 0,
          }}
        >
          {title}
        </h2>

        {monthDisplay && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                fontFamily: "DM Sans, sans-serif",
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
                fontSize: "12px",
                color: "#f0ede8",
                minWidth: "120px",
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
                fontFamily: "DM Sans, sans-serif",
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

      {/* Right — Log Activity button */}
      <button
        onClick={onLogActivity}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#3dd68c",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: "600",
          fontFamily: "DM Sans, sans-serif",
          color: "#071a0e",
          cursor: "pointer",
          transition: "background-color 0.12s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#4feda6")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#3dd68c")
        }
      >
        <span style={{ fontSize: "18px", lineHeight: 1, marginTop: "-1px" }}>
          +
        </span>
        Log Activity
      </button>
    </header>
  );
}
