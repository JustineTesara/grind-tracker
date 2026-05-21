import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Eye icons for show/hide password toggle
function EyeIcon({ open }) {
  return open ? (
    // Eye open — password is visible
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    // Eye closed — password is hidden
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// Reusable input field component
function FormField({ label, type, value, onChange, placeholder }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label
        style={{
          fontSize: "11px",
          fontFamily: "DM Mono, monospace",
          letterSpacing: "0.12em",
          color: "#555450",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          style={{
            width: "100%",
            backgroundColor: "#1c1c1f",
            border: "1px solid #2a2a2e",
            borderRadius: "10px",
            padding: isPassword ? "13px 46px 13px 16px" : "13px 16px",
            fontSize: "14px",
            fontFamily: "DM Sans, sans-serif",
            color: "#f0ede8",
            outline: "none",
            transition: "border-color 0.15s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3dd68c")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2a2e")}
        />
        {/* Show/hide toggle button — only renders for password fields */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: showPassword ? "#3dd68c" : "#444440",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#3dd68c")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = showPassword
                ? "#3dd68c"
                : "#444440")
            }
            // Prevent form submission when clicking the eye icon
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setSuccess("");
    setFullName("");
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/");
    } else {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) setError(error.message);
      else {
        setSuccess("Account created! You can now log in.");
        switchMode("login");
      }
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0d0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        // Subtle radial glow in the background for depth
        backgroundImage:
          "radial-gradient(ellipse at 50% 40%, rgba(61,214,140,0.04) 0%, transparent 70%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "52px",
              fontWeight: "800",
              color: "#f0ede8",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              margin: "0 0 8px 0",
            }}
          >
            GRIND<span style={{ color: "#3dd68c" }}>.</span>
          </h1>
          <p
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              color: "#3a3a3e",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Routine Tracker
          </p>
        </div>

        {/* ── Card ── */}
        <div
          style={{
            backgroundColor: "#141416",
            border: "1px solid #1e1e22",
            borderRadius: "20px",
            padding: "36px",
            // Subtle inner glow on the card border
            boxShadow:
              "0 0 0 1px rgba(61,214,140,0.04), 0 24px 48px rgba(0,0,0,0.4)",
          }}
        >
          {/* ── Tab switcher ── */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#0d0d0f",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "32px",
            }}
          >
            {["login", "signup"].map((tab) => (
              <button
                key={tab}
                onClick={() => switchMode(tab)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "9px",
                  border: "none",
                  fontSize: "13.5px",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: mode === tab ? "600" : "400",
                  color: mode === tab ? "#f0ede8" : "#444440",
                  backgroundColor: mode === tab ? "#1e1e22" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  // Subtle green underline on active tab
                  boxShadow:
                    mode === tab
                      ? "0 1px 0 0 rgba(61,214,140,0.4) inset"
                      : "none",
                }}
              >
                {tab === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Full name — signup only */}
            {mode === "signup" && (
              <FormField
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Dela Cruz"
              />
            )}

            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@email.com"
            />

            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {/* Error message */}
            {error && (
              <div
                style={{
                  backgroundColor: "rgba(255,80,50,0.08)",
                  border: "1px solid rgba(255,80,50,0.25)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  color: "#ff7055",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div
                style={{
                  backgroundColor: "rgba(61,214,140,0.08)",
                  border: "1px solid rgba(61,214,140,0.25)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  color: "#3dd68c",
                  lineHeight: 1.5,
                }}
              >
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                backgroundColor: loading ? "#2a6b47" : "#3dd68c",
                border: "none",
                borderRadius: "12px",
                padding: "15px",
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "DM Sans, sans-serif",
                color: "#071a0e",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#4feda6";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#3dd68c";
              }}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>
          </form>
        </div>

        {/* ── Bottom tagline ── */}
        <p
          style={{
            textAlign: "center",
            fontFamily: "DM Mono, monospace",
            fontSize: "11px",
            color: "#2a2a2e",
            letterSpacing: "0.08em",
            marginTop: "24px",
          }}
        >
          Track every rep. Every km. Every day.
        </p>
      </div>
    </div>
  );
}
