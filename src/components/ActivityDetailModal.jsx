import { RUN_ZONES } from "../lib/zones";

const TYPE_STYLE = {
  run: { color: "#3dd68c", icon: "🏃", label: "Run" },
  cycle: { color: "#3b9eff", icon: "🚴", label: "Cycling" },
  gym: { color: "#ff6b35", icon: "🏋️", label: "Gym" },
  rest: { color: "#6b6b80", icon: "😴", label: "Rest Day" },
};

export default function ActivityDetailModal({
  activity,
  onClose,
  onDelete,
  onEdit,
}) {
  if (!activity) return null;
  const s = TYPE_STYLE[activity.type];
  const dur =
    activity.duration_hours > 0
      ? `${activity.duration_hours}h ${activity.duration_minutes}m`
      : `${activity.duration_minutes}m`;
  const isCardio = activity.type === "run" || activity.type === "cycle";
  const zone = isCardio && activity.effort ? RUN_ZONES[activity.effort] : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#141416",
          border: "1px solid #242428",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "460px",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "32px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: `${s.color}15`,
                border: `1px solid ${s.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              {s.icon}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#f0ede8",
                  margin: 0,
                }}
              >
                {s.label}
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "#444440",
                  fontFamily: "DM Mono, monospace",
                  margin: "4px 0 0",
                }}
              >
                {activity.date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#444440",
              cursor: "pointer",
              fontSize: "22px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ede8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444440")}
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        {activity.type !== "rest" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {[
              { label: "Duration", value: dur },
              activity.distance
                ? { label: "Distance", value: `${activity.distance} km` }
                : null,
              activity.effort
                ? {
                    label: isCardio ? `Zone ${zone?.zone ?? ""}` : "Effort",
                    value: `${activity.effort}/10`,
                  }
                : null,
            ]
              .filter(Boolean)
              .map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: "#1c1c1f",
                    borderRadius: "10px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "20px",
                      fontWeight: "700",
                      color:
                        isCardio && stat.label.startsWith("Zone")
                          ? zone?.color
                          : s.color,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: "10px",
                      color: "#444440",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginTop: "4px",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Zone description for cardio */}
        {zone && (
          <div
            style={{
              backgroundColor: `${zone.color}10`,
              border: `1px solid ${zone.color}25`,
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontFamily: "DM Mono, monospace",
                color: zone.color,
                fontWeight: "700",
              }}
            >
              Z{zone.zone}
            </span>
            <span
              style={{
                width: "1px",
                height: "12px",
                backgroundColor: "#2a2a2e",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "#8a8880",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {zone.name.split("—")[1]?.trim()} — {zone.desc}
            </span>
          </div>
        )}

        {/* Workout list */}
        {activity.workout_list && (
          <div
            style={{
              backgroundColor: "#1c1c1f",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: "10px",
                color: "#444440",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px",
              }}
            >
              Workout List{" "}
              {activity.weight_unit ? `(${activity.weight_unit})` : ""}
            </p>
            {activity.workout_list.split("\n").map((line, i, arr) => (
              <div
                key={i}
                style={{
                  fontSize: "13px",
                  color: "#8a8880",
                  fontFamily: "DM Sans, sans-serif",
                  padding: "5px 0",
                  borderBottom:
                    i < arr.length - 1 ? "1px solid #242428" : "none",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {activity.notes && (
          <div
            style={{
              backgroundColor: "#1c1c1f",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: "10px",
                color: "#444440",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Notes
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#8a8880",
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {activity.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onDelete(activity.id)}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "1px solid rgba(255,80,50,0.25)",
              backgroundColor: "transparent",
              color: "rgba(255,80,50,0.6)",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,80,50,0.08)";
              e.currentTarget.style.color = "#ff5032";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(255,80,50,0.6)";
            }}
          >
            Delete
          </button>
          <button
            onClick={() => onEdit(activity)}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "1px solid #3dd68c40",
              backgroundColor: "rgba(61,214,140,0.06)",
              color: "#3dd68c",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(61,214,140,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(61,214,140,0.06)";
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#1c1c1f",
              color: "#f0ede8",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#242428")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#1c1c1f")
            }
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
