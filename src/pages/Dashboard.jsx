import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getActivities, deleteActivity } from "../lib/api";
import {
  exportToCSV,
  getWeekActivities,
  getMonthActivities,
  computeStats,
} from "../lib/exportData";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Calendar from "../components/Calendar";
import LogActivityModal from "../components/LogActivityModal";
import ActivityDetailModal from "../components/ActivityDetailModal";

const PAGE_TITLES = {
  calendar: "Calendar",
  weekly: "Weekly Summary",
  feedback: "Coach Feedback",
};

function StatCard({ label, value, unit, color }) {
  return (
    <div
      style={{
        backgroundColor: "#141416",
        border: "1px solid #1c1c1f",
        borderRadius: "12px",
        padding: "18px",
        borderTop: `2px solid ${color}`,
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontFamily: "DM Mono, monospace",
          letterSpacing: "0.1em",
          color: "#444440",
          textTransform: "uppercase",
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "28px",
          fontFamily: "Syne, sans-serif",
          fontWeight: "700",
          color: "#f0ede8",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {value}
        <span style={{ fontSize: "13px", color: "#444440", marginLeft: "4px" }}>
          {unit}
        </span>
      </p>
      <p
        style={{
          fontSize: "11px",
          color: "#2e2e30",
          margin: "4px 0 0",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        this month
      </p>
    </div>
  );
}

function ProgressRow({ label, value, max, unit, color }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5px",
        }}
      >
        <span
          style={{
            fontSize: "12.5px",
            color: "#8a8880",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#555450",
            fontFamily: "DM Mono, monospace",
          }}
        >
          {value % 1 === 0 ? value : value.toFixed(1)} {unit}
        </span>
      </div>
      <div
        style={{
          height: "5px",
          backgroundColor: "#1c1c1f",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: "99px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function FeedbackItem({ type, text }) {
  const colors = { good: "#3dd68c", warn: "#f5c842", bad: "#ff6b35" };
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid #1c1c1f",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          backgroundColor: colors[type],
          marginTop: "5px",
          flexShrink: 0,
        }}
      />
      <p
        style={{
          fontSize: "12.5px",
          color: "#8a8880",
          fontFamily: "DM Sans, sans-serif",
          lineHeight: 1.6,
          margin: 0,
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

function generateFeedback(acts) {
  const runActs = acts.filter((a) => a.type === "run");
  const cycleActs = acts.filter((a) => a.type === "cycle");
  const gymActs = acts.filter((a) => a.type === "gym");
  const activeDays = new Set(
    acts.filter((a) => a.type !== "rest").map((a) => a.date),
  ).size;
  const cardioMin = [...runActs, ...cycleActs].reduce(
    (s, a) => s + (a.duration_hours ?? 0) * 60 + (a.duration_minutes ?? 0),
    0,
  );

  if (acts.length === 0) {
    return [
      {
        type: "warn",
        text: "No activities logged this week yet. Start by clicking <strong>+ Log Activity</strong>.",
      },
    ];
  }

  const items = [];

  if (activeDays >= 5)
    items.push({
      type: "good",
      text: `<strong>Excellent consistency!</strong> You've been active ${activeDays} days this week.`,
    });
  else if (activeDays >= 3)
    items.push({
      type: "warn",
      text: `<strong>Good effort.</strong> ${activeDays} active days. Target 4–5 for optimal progress.`,
    });
  else
    items.push({
      type: "bad",
      text: `<strong>Low frequency.</strong> Only ${activeDays} active day(s). Aim for at least 3 sessions.`,
    });

  if (gymActs.length === 0)
    items.push({
      type: "warn",
      text: "<strong>No gym sessions logged.</strong> Add 2–3 strength sessions per week to prevent injury.",
    });
  else if (gymActs.length >= 3)
    items.push({
      type: "good",
      text: `<strong>Solid gym work!</strong> ${gymActs.length} sessions this week. Rotate muscle groups for recovery.`,
    });

  if (cardioMin >= 150)
    items.push({
      type: "good",
      text: `<strong>Cardio target met!</strong> ${Math.round(cardioMin)} min logged — above the 150 min/week recommendation.`,
    });
  else if (cardioMin > 0)
    items.push({
      type: "warn",
      text: `<strong>Boost cardio.</strong> ${Math.round(cardioMin)} min logged. Aim for 150 min/week.`,
    });
  else
    items.push({
      type: "bad",
      text: "<strong>Zero cardio this week.</strong> Running or cycling at least 2× per week improves cardiovascular health.",
    });

  return items;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [activePage, setActivePage] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logModalDate, setLogModalDate] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editActivity, setEditActivity] = useState(null);

  useEffect(() => {
    if (!user) return;
    getActivities(user.id)
      .then((data) => setActivities(data))
      .catch((err) => console.error("Error loading activities:", err))
      .finally(() => setLoading(false));
  }, [user]);

  function handleActivitySaved(newActivity) {
    setActivities((prev) => [newActivity, ...prev]);
  }

  function handleActivityUpdated(updated) {
    setActivities((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
  }

  async function handleDeleteActivity(id) {
    await deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setSelectedActivity(null);
  }

  function handleDayClick(ds) {
    setLogModalDate(ds);
    setEditActivity(null);
    setShowLogModal(true);
  }

  function handleEditActivity(activity) {
    setSelectedActivity(null);
    setEditActivity(activity);
    setShowLogModal(true);
  }

  function openLogModal() {
    setLogModalDate(null);
    setEditActivity(null);
    setShowLogModal(true);
  }

  function closeLogModal() {
    setShowLogModal(false);
    setEditActivity(null);
    setLogModalDate(null);
  }

  const handlePrevMonth = () =>
    setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  const monthDisplay = currentDate
    .toLocaleString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  const monthActs = getMonthActivities(activities, currentDate);
  const weekActs = getWeekActivities(activities);
  const monthStats = computeStats(monthActs);
  const weekStats = computeStats(weekActs);
  const feedback = generateFeedback(weekActs);

  const score = Math.round(
    Math.min(30, (weekStats.runDist / 20) * 30) +
      Math.min(20, (weekStats.cycleDist / 50) * 20) +
      Math.min(25, (weekStats.gymCount / 4) * 25) +
      Math.min(25, (weekStats.activeDays / 5) * 25),
  );
  const scoreColor =
    score >= 75 ? "#3dd68c" : score >= 45 ? "#f5c842" : "#ff6b35";
  const scoreLabel =
    score >= 75 ? "Excellent" : score >= 45 ? "Keep Going" : "Just Starting";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0d0d0f",
      }}
    >
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar
          title={PAGE_TITLES[activePage]}
          monthDisplay={activePage === "calendar" ? monthDisplay : null}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onLogActivity={openLogModal}
        />

        <main style={{ flex: 1, padding: "28px 32px" }}>
          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <StatCard
              label="Run Distance"
              value={monthStats.runDist.toFixed(1)}
              unit="km"
              color="#3dd68c"
            />
            <StatCard
              label="Cycle Distance"
              value={monthStats.cycleDist.toFixed(1)}
              unit="km"
              color="#3b9eff"
            />
            <StatCard
              label="Gym Sessions"
              value={monthStats.gymCount}
              unit="sessions"
              color="#ff6b35"
            />
            <StatCard
              label="Active Days"
              value={monthStats.activeDays}
              unit="days"
              color="#3dd68c"
            />
          </div>

          {/* ── CALENDAR ── */}
          {activePage === "calendar" &&
            (loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px",
                  color: "#333330",
                  fontFamily: "DM Mono, monospace",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                }}
              >
                LOADING...
              </div>
            ) : (
              <Calendar
                currentDate={currentDate}
                activities={activities}
                onDayClick={handleDayClick}
                onActivityClick={setSelectedActivity}
              />
            ))}

          {/* ── WEEKLY SUMMARY ── */}
          {activePage === "weekly" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#141416",
                  border: "1px solid #1c1c1f",
                  borderRadius: "14px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#8a8880",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    This Week
                  </h3>
                  <button
                    onClick={() => exportToCSV(weekActs, "weekly")}
                    style={{
                      fontSize: "11px",
                      fontFamily: "DM Mono, monospace",
                      color: "#3dd68c",
                      background: "none",
                      border: "1px solid rgba(61,214,140,0.3)",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(61,214,140,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    ↓ Export CSV
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  {[
                    { label: "Active Days", value: weekStats.activeDays },
                    { label: "Total Minutes", value: weekStats.totalMin },
                  ].map((s) => (
                    <div
                      key={s.label}
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
                          fontSize: "22px",
                          fontWeight: "700",
                          color: "#f0ede8",
                        }}
                      >
                        {s.value}
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
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
                <ProgressRow
                  label="Running"
                  value={weekStats.runDist}
                  max={30}
                  unit="km"
                  color="#3dd68c"
                />
                <ProgressRow
                  label="Cycling"
                  value={weekStats.cycleDist}
                  max={80}
                  unit="km"
                  color="#3b9eff"
                />
                <ProgressRow
                  label="Gym"
                  value={weekStats.gymCount}
                  max={5}
                  unit="sessions"
                  color="#ff6b35"
                />
              </div>

              <div
                style={{
                  backgroundColor: "#141416",
                  border: "1px solid #1c1c1f",
                  borderRadius: "14px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#8a8880",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    This Month
                  </h3>
                  <button
                    onClick={() => exportToCSV(monthActs, "monthly")}
                    style={{
                      fontSize: "11px",
                      fontFamily: "DM Mono, monospace",
                      color: "#3b9eff",
                      background: "none",
                      border: "1px solid rgba(59,158,255,0.3)",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(59,158,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    ↓ Export CSV
                  </button>
                </div>
                <ProgressRow
                  label="Running"
                  value={monthStats.runDist}
                  max={100}
                  unit="km"
                  color="#3dd68c"
                />
                <ProgressRow
                  label="Cycling"
                  value={monthStats.cycleDist}
                  max={300}
                  unit="km"
                  color="#3b9eff"
                />
                <ProgressRow
                  label="Gym"
                  value={monthStats.gymCount}
                  max={20}
                  unit="sessions"
                  color="#ff6b35"
                />
                <ProgressRow
                  label="Active Days"
                  value={monthStats.activeDays}
                  max={25}
                  unit="days"
                  color="#8b8bff"
                />
              </div>
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {activePage === "feedback" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 320px",
                gap: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#141416",
                  border: "1px solid #1c1c1f",
                  borderRadius: "14px",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#8a8880",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Coach Feedback
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#2e2e30",
                    fontFamily: "DM Sans, sans-serif",
                    marginBottom: "20px",
                  }}
                >
                  Based on your activity this week
                </p>
                {feedback.map((f, i) => (
                  <FeedbackItem key={i} type={f.type} text={f.text} />
                ))}
              </div>

              <div
                style={{
                  backgroundColor: "#141416",
                  border: "1px solid #1c1c1f",
                  borderRadius: "14px",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#8a8880",
                    margin: "0 0 20px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Fitness Score
                </h3>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div
                    style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      border: `3px solid ${scoreColor}`,
                      backgroundColor: `${scoreColor}15`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontSize: "28px",
                        fontWeight: "800",
                        color: scoreColor,
                      }}
                    >
                      {score}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#f0ede8",
                      margin: "0 0 4px",
                    }}
                  >
                    {scoreLabel}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#444440",
                      fontFamily: "DM Sans, sans-serif",
                      margin: 0,
                    }}
                  >
                    out of 100 this week
                  </p>
                </div>
                <div
                  style={{
                    height: "6px",
                    backgroundColor: "#1c1c1f",
                    borderRadius: "99px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${score}%`,
                      backgroundColor: scoreColor,
                      borderRadius: "99px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#2e2e30",
                      fontFamily: "DM Mono, monospace",
                    }}
                  >
                    0
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#2e2e30",
                      fontFamily: "DM Mono, monospace",
                    }}
                  >
                    100
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Log / Edit Modal */}
      {showLogModal && (
        <LogActivityModal
          defaultDate={logModalDate}
          editActivity={editActivity}
          onClose={closeLogModal}
          onSaved={handleActivitySaved}
          onUpdated={handleActivityUpdated}
        />
      )}

      {/* Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onDelete={handleDeleteActivity}
          onEdit={handleEditActivity}
        />
      )}
    </div>
  );
}
