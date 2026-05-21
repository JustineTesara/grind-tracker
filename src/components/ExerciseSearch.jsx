import { useState, useRef, useEffect } from "react";
import { searchExercises } from "../lib/exercises";

const CATEGORY_COLORS = {
  chest: "#ff6b35",
  back: "#3b9eff",
  shoulders: "#a78bfa",
  arms: "#f59e0b",
  legs: "#3dd68c",
  core: "#f43f5e",
  cardio: "#06b6d4",
};

export default function ExerciseSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search exercise...",
}) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const wrapRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    onChange(val);
    const found = searchExercises(val);
    setResults(found);
    setOpen(found.length > 0);
  }

  function handleSelect(exercise) {
    onSelect(exercise.name);
    setOpen(false);
  }

  const inputStyle = {
    width: "100%",
    backgroundColor: "#1c1c1f",
    border: "1px solid #2a2a2e",
    borderRadius: "10px",
    padding: "9px 10px",
    fontSize: "12.5px",
    fontFamily: "DM Sans, sans-serif",
    color: "#f0ede8",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        style={inputStyle}
        onFocus2={(e) => (e.target.style.borderColor = "#ff6b35")}
        onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
      />

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#1c1c1f",
            border: "1px solid #2a2a2e",
            borderRadius: "10px",
            zIndex: 300,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {results.map((ex, i) => (
            <div
              key={i}
              onMouseDown={() => handleSelect(ex)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                cursor: "pointer",
                borderBottom:
                  i < results.length - 1 ? "1px solid #242428" : "none",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#242428")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#f0ede8",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {ex.name}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: "DM Mono, monospace",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: CATEGORY_COLORS[ex.category] || "#555450",
                  backgroundColor: `${CATEGORY_COLORS[ex.category]}18`,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {ex.category}
              </span>
            </div>
          ))}
          {/* Custom exercise hint */}
          <div style={{ padding: "8px 12px", borderTop: "1px solid #1a1a1a" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#333330",
                fontFamily: "DM Mono, monospace",
                letterSpacing: "0.05em",
              }}
            >
              Press Enter to use custom exercise
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
