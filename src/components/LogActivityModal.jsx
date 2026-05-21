import { useState, useEffect } from "react";
import { createActivity, updateActivity } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ExerciseSearch from "./ExerciseSearch";
import { RUN_ZONES, EFFORT_LABELS } from "../lib/zones";

const TYPES = [
  { id: "run", label: "Running", icon: "🏃", color: "#3dd68c" },
  { id: "cycle", label: "Cycling", icon: "🚴", color: "#3b9eff" },
  { id: "gym", label: "Gym", icon: "🏋️", color: "#ff6b35" },
  { id: "rest", label: "Rest Day", icon: "😴", color: "#6b6b80" },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function LogActivityModal({
  onClose,
  onSaved,
  onUpdated,
  defaultDate,
  editActivity,
}) {
  const { user } = useAuth();
  const isEdit = !!editActivity;

  // Pre-fill all fields if editing
  const [type, setType] = useState(editActivity?.type || "run");
  const [date, setDate] = useState(
    editActivity?.date || defaultDate || todayStr(),
  );
  const [hours, setHours] = useState(editActivity?.duration_hours ?? 0);
  const [minutes, setMinutes] = useState(editActivity?.duration_minutes ?? 30);
  const [distance, setDistance] = useState(editActivity?.distance ?? "");
  const [effort, setEffort] = useState(editActivity?.effort ?? 5);
  const [notes, setNotes] = useState(editActivity?.notes ?? "");
  const [weightUnit, setWeightUnit] = useState(
    editActivity?.weight_unit || "kg",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Parse saved workout_list string back into rows when editing
  const parseWorkouts = () => {
    if (!editActivity?.workout_list)
      return [{ exercise: "", sets: "", reps: "", weight: "" }];
    return editActivity.workout_list.split("\n").map((line) => {
      // Parse format: "Exercise — 4 sets × 10 reps @ 60kg"
      const exMatch = line.match(/^([^—]+)/);
      const setMatch = line.match(/(\d+)\s*sets?/);
      const repMatch = line.match(/×\s*(\d+)\s*reps?/);
      const wgtMatch = line.match(/@\s*([\d.]+)/);
      return {
        exercise: exMatch ? exMatch[1].trim() : line,
        sets: setMatch ? setMatch[1] : "",
        reps: repMatch ? repMatch[1] : "",
        weight: wgtMatch ? wgtMatch[1] : "",
      };
    });
  };

  const [workouts, setWorkouts] = useState(parseWorkouts);

  const selected = TYPES.find((t) => t.id === type);
  const isCardio = type === "run" || type === "cycle";
  const zone = isCardio ? RUN_ZONES[effort] : null;

  function updateWorkout(i, field, value) {
    setWorkouts((prev) =>
      prev.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)),
    );
  }
  function addRow() {
    setWorkouts((prev) => [
      ...prev,
      { exercise: "", sets: "", reps: "", weight: "" },
    ]);
  }
  function removeRow(i) {
    setWorkouts((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Convert weight for display when unit toggles
  function toggleUnit() {
    setWeightUnit((prev) => {
      const next = prev === "kg" ? "lbs" : "kg";
      setWorkouts((rows) =>
        rows.map((w) => {
          if (!w.weight) return w;
          const n = parseFloat(w.weight);
          if (isNaN(n)) return w;
          const converted =
            prev === "kg" ? (n * 2.20462).toFixed(1) : (n / 2.20462).toFixed(1);
          return { ...w, weight: converted };
        }),
      );
      return next;
    });
  }

  async function handleSave() {
    setError("");
    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (type !== "rest" && Number(hours) === 0 && Number(minutes) === 0) {
      setError("Please enter a duration.");
      return;
    }

    const workoutList =
      type === "gym"
        ? workouts
            .filter((w) => w.exercise.trim())
            .map((w) => {
              let line = w.exercise;
              if (w.sets) line += ` — ${w.sets} sets`;
              if (w.reps) line += ` × ${w.reps} reps`;
              if (w.weight) line += ` @ ${w.weight}${weightUnit}`;
              return line;
            })
            .join("\n")
        : null;

    const payload = {
      date,
      type,
      duration_hours: type === "rest" ? 0 : Number(hours),
      duration_minutes: type === "rest" ? 0 : Number(minutes),
      distance: distance ? Number(distance) : null,
      workout_list: workoutList,
      effort: type === "rest" ? null : effort,
      notes: notes || null,
      weight_unit: weightUnit,
    };

    setLoading(true);
    try {
      if (isEdit) {
        const updated = await updateActivity(editActivity.id, payload);
        onUpdated(updated);
      } else {
        const saved = await createActivity({ ...payload, user_id: user.id });
        onSaved(saved);
      }
      onClose();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  // ── Styles ──
  const overlay = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  };
  const card = {
    backgroundColor: "#141416",
    border: "1px solid #242428",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "92vh",
    overflowY: "auto",
    padding: "32px",
    boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
  };
  const inputStyle = {
    width: "100%",
    backgroundColor: "#1c1c1f",
    border: "1px solid #2a2a2e",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "13.5px",
    fontFamily: "DM Sans, sans-serif",
    color: "#f0ede8",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  const labelStyle = {
    fontSize: "10px",
    fontFamily: "DM Mono, monospace",
    letterSpacing: "0.12em",
    color: "#555450",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  };
  const sectionGap = { marginBottom: "20px" };

  return (
    <div
      style={overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={card}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
          }}
        >
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
              {isEdit ? "Edit Activity" : "Log Activity"}
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#444440",
                marginTop: "4px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {isEdit
                ? `Editing entry for ${editActivity.date}`
                : `Recording for ${date}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#444440",
              cursor: "pointer",
              fontSize: "22px",
              lineHeight: 1,
              padding: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ede8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444440")}
          >
            ✕
          </button>
        </div>

        {/* ── Activity Type ── */}
        <div style={sectionGap}>
          <span style={labelStyle}>Activity Type</span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
            }}
          >
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  padding: "14px 8px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  border:
                    type === t.id
                      ? `1px solid ${t.color}`
                      : "1px solid #242428",
                  backgroundColor: type === t.id ? `${t.color}15` : "#1c1c1f",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "22px" }}>{t.icon}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: "500",
                    color: type === t.id ? t.color : "#555450",
                  }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Date ── */}
        <div style={sectionGap}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = selected.color)}
            onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
          />
        </div>

        {/* ── Duration ── */}
        {type !== "rest" && (
          <div style={sectionGap}>
            <label style={labelStyle}>Duration</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {[
                { label: "HRS", value: hours, setter: setHours, max: 23 },
                { label: "MIN", value: minutes, setter: setMinutes, max: 59 },
              ].map((f) => (
                <div key={f.label} style={{ position: "relative" }}>
                  <input
                    type="number"
                    min="0"
                    max={f.max}
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    style={{ ...inputStyle, paddingRight: "44px" }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = selected.color)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "10px",
                      color: "#444440",
                      fontFamily: "DM Mono, monospace",
                      pointerEvents: "none",
                    }}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Distance ── */}
        {isCardio && (
          <div style={sectionGap}>
            <label style={labelStyle}>Distance (km)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="e.g. 5.0"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = selected.color)}
              onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
            />
          </div>
        )}

        {/* ── GYM: Workout Table with search ── */}
        {type === "gym" && (
          <div style={sectionGap}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <label style={{ ...labelStyle, margin: 0 }}>Workout List</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {/* KG / LBS toggle */}
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#0d0d0f",
                    borderRadius: "8px",
                    padding: "3px",
                    border: "1px solid #242428",
                  }}
                >
                  {["kg", "lbs"].map((u) => (
                    <button
                      key={u}
                      onClick={toggleUnit}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "11px",
                        fontFamily: "DM Mono, monospace",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        backgroundColor:
                          weightUnit === u ? "#ff6b35" : "transparent",
                        color: weightUnit === u ? "#0d0d0f" : "#444440",
                        fontWeight: weightUnit === u ? "700" : "400",
                      }}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={addRow}
                  style={{
                    fontSize: "11px",
                    fontFamily: "DM Mono, monospace",
                    color: "#ff6b35",
                    background: "none",
                    border: "1px solid rgba(255,107,53,0.3)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,107,53,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2.2fr 0.7fr 0.7fr 0.9fr 24px",
                gap: "6px",
                marginBottom: "6px",
                padding: "0 2px",
              }}
            >
              {["Exercise", "Sets", "Reps", `Weight (${weightUnit})`, ""].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: "9px",
                      fontFamily: "DM Mono, monospace",
                      color: "#333330",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </span>
                ),
              )}
            </div>

            {/* Rows */}
            {workouts.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.2fr 0.7fr 0.7fr 0.9fr 24px",
                  gap: "6px",
                  marginBottom: "6px",
                  alignItems: "start",
                }}
              >
                {/* Exercise with autocomplete */}
                <ExerciseSearch
                  value={w.exercise}
                  onChange={(val) => updateWorkout(i, "exercise", val)}
                  onSelect={(name) => updateWorkout(i, "exercise", name)}
                  placeholder="Search exercise..."
                />
                <input
                  placeholder="4"
                  value={w.sets}
                  type="number"
                  min="0"
                  onChange={(e) => updateWorkout(i, "sets", e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: "9px 8px",
                    fontSize: "12.5px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b35")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
                />
                <input
                  placeholder="10"
                  value={w.reps}
                  type="number"
                  min="0"
                  onChange={(e) => updateWorkout(i, "reps", e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: "9px 8px",
                    fontSize: "12.5px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b35")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
                />
                <input
                  placeholder="60"
                  value={w.weight}
                  type="number"
                  min="0"
                  step="0.5"
                  onChange={(e) => updateWorkout(i, "weight", e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: "9px 8px",
                    fontSize: "12.5px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b35")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
                />
                <button
                  onClick={() => removeRow(i)}
                  disabled={workouts.length === 1}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#333330",
                    cursor: workouts.length === 1 ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (workouts.length > 1)
                      e.currentTarget.style.color = "#ff5032";
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#333330")
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Effort / Zone slider ── */}
        {type !== "rest" && (
          <div style={sectionGap}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label style={{ ...labelStyle, margin: 0 }}>
                {isCardio ? "Training Zone" : "Effort Level"}
              </label>
              {/* Cardio: show zone badge */}
              {isCardio && zone ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{
                      backgroundColor: `${zone.color}20`,
                      border: `1px solid ${zone.color}50`,
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontFamily: "DM Mono, monospace",
                      color: zone.color,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Z{zone.zone}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: zone.color,
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: "500",
                    }}
                  >
                    {zone.name.split("—")[1]?.trim()}
                  </span>
                </div>
              ) : (
                // Gym: show effort label
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "DM Mono, monospace",
                    color: selected.color,
                  }}
                >
                  {effort}/10 — {EFFORT_LABELS[effort]}
                </span>
              )}
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={effort}
              onChange={(e) => setEffort(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: isCardio
                  ? zone?.color || selected.color
                  : selected.color,
                cursor: "pointer",
                marginBottom: "6px",
              }}
            />

            {/* Cardio: zone description bar */}
            {isCardio && zone && (
              <div
                style={{
                  backgroundColor: `${zone.color}12`,
                  border: `1px solid ${zone.color}25`,
                  borderRadius: "8px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#333330",
                    fontFamily: "DM Mono, monospace",
                    letterSpacing: "0.06em",
                  }}
                >
                  {effort}/10
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
                    color: zone.color,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {zone.desc}
                </span>
              </div>
            )}

            {/* Cardio: zone reference legend */}
            {isCardio && (
              <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                {[
                  { z: 1, c: "#6b6b80", label: "Z1" },
                  { z: 2, c: "#3dd68c", label: "Z2" },
                  { z: 3, c: "#f5c842", label: "Z3" },
                  { z: 4, c: "#ff9500", label: "Z4" },
                  { z: 5, c: "#ff5032", label: "Z5" },
                ].map((z) => (
                  <div
                    key={z.z}
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      backgroundColor: zone?.zone === z.z ? z.c : `${z.c}30`,
                      transition: "background-color 0.2s",
                    }}
                    title={z.label}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Notes ── */}
        <div style={sectionGap}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any PRs today?"
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            onFocus={(e) => (e.target.style.borderColor = selected.color)}
            onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
          />
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            style={{
              backgroundColor: "rgba(255,80,50,0.08)",
              border: "1px solid rgba(255,80,50,0.25)",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "13px",
              color: "#ff7055",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid #242428",
              backgroundColor: "#1c1c1f",
              color: "#8a8880",
              fontSize: "13.5px",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ede8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8880")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 2,
              padding: "13px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: loading ? "#1c1c1f" : selected.color,
              color: loading ? "#444440" : "#071a0e",
              fontSize: "13.5px",
              fontWeight: "600",
              fontFamily: "DM Sans, sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {loading
              ? "Saving..."
              : isEdit
                ? "✓ Save Changes"
                : "✓ Save Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
