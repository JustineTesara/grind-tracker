const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_STYLE = {
  run: { bg: "rgba(61,214,140,0.15)", color: "#3dd68c", icon: "🏃" },
  cycle: { bg: "rgba(59,158,255,0.15)", color: "#3b9eff", icon: "🚴" },
  gym: { bg: "rgba(255,107,53,0.15)", color: "#ff6b35", icon: "🏋️" },
  rest: { bg: "rgba(107,107,128,0.12)", color: "#6b6b80", icon: "😴" },
};

const calStyle = `
  @media (max-width: 600px) {
    .grind-cal-pill-text { display: none; }
    .grind-cal-dur       { display: none; }
    .grind-cal-cell      { min-height: 56px !important; padding: 5px !important; }
    .grind-cal-dow       { font-size: 8px !important; padding: 7px 0 !important; }
    .grind-cal-daynum    { width: 18px !important; height: 18px !important; font-size: 9px !important; }
  }
  @media (max-width: 380px) {
    .grind-cal-cell { min-height: 44px !important; padding: 3px !important; }
  }
`;

function dateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayStr() {
  return dateStr(new Date());
}

export default function Calendar({
  currentDate,
  activities,
  onDayClick,
  onActivityClick,
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();

  // Group activities by date for O(1) lookup
  const byDate = {};
  activities.forEach((a) => {
    if (!byDate[a.date]) byDate[a.date] = [];
    byDate[a.date].push(a);
  });

  const cells = [];

  // Empty cells before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(
      <div
        key={`empty-${i}`}
        className="grind-cal-cell"
        style={{
          minHeight: "90px",
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRight: "1px solid #1c1c1f",
          borderBottom: "1px solid #1c1c1f",
        }}
      />,
    );
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const acts = byDate[ds] || [];
    const isToday = ds === today;

    cells.push(
      <div
        key={ds}
        className="grind-cal-cell"
        onClick={() => onDayClick(ds)}
        style={{
          minHeight: "90px",
          padding: "8px",
          borderRight: "1px solid #1c1c1f",
          borderBottom: "1px solid #1c1c1f",
          cursor: "pointer",
          backgroundColor: acts.length
            ? "rgba(255,255,255,0.015)"
            : "transparent",
          transition: "background-color 0.12s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = acts.length
            ? "rgba(255,255,255,0.015)"
            : "transparent")
        }
      >
        {/* Day number circle */}
        <div
          className="grind-cal-daynum"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: isToday ? "#3dd68c" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              color: isToday ? "#071a0e" : "#555450",
              fontWeight: isToday ? "700" : "400",
            }}
          >
            {d}
          </span>
        </div>

        {/* Activity pills — max 2 shown, then +N more */}
        {acts.slice(0, 2).map((a) => {
          const s = TYPE_STYLE[a.type];
          const dur =
            a.duration_hours > 0
              ? `${a.duration_hours}h ${a.duration_minutes}m`
              : `${a.duration_minutes}m`;

          return (
            <div
              key={a.id}
              onClick={(e) => {
                e.stopPropagation();
                onActivityClick(a);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: s.bg,
                marginBottom: "3px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "9px" }}>{s.icon}</span>

              {/* Hidden on screens < 600px */}
              <span
                className="grind-cal-pill-text"
                style={{
                  fontSize: "10px",
                  color: s.color,
                  fontWeight: "500",
                  fontFamily: "DM Sans, sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {a.type === "rest"
                  ? "Rest"
                  : a.type === "gym"
                    ? "Gym"
                    : `${a.distance ?? "—"}km`}
              </span>

              {/* Duration — hidden on screens < 600px */}
              {a.type !== "rest" && (
                <span
                  className="grind-cal-dur"
                  style={{
                    fontSize: "9px",
                    color: "#333330",
                    fontFamily: "DM Mono, monospace",
                    marginLeft: "auto",
                    flexShrink: 0,
                  }}
                >
                  {dur}
                </span>
              )}
            </div>
          );
        })}

        {acts.length > 2 && (
          <div
            style={{
              fontSize: "9px",
              color: "#333330",
              fontFamily: "DM Mono, monospace",
              marginTop: "2px",
            }}
          >
            +{acts.length - 2} more
          </div>
        )}
      </div>,
    );
  }

  return (
    <>
      {/* Inject responsive styles */}
      <style>{calStyle}</style>

      <div
        style={{
          backgroundColor: "#141416",
          border: "1px solid #1c1c1f",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* Day-of-week header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: "1px solid #1c1c1f",
          }}
        >
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="grind-cal-dow"
              style={{
                padding: "10px 0",
                textAlign: "center",
                fontFamily: "DM Mono, monospace",
                fontSize: "10px",
                color: "#333330",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells}
        </div>
      </div>
    </>
  );
}
