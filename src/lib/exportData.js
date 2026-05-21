// Convert activities array into a downloadable CSV / spreadsheet file
export function exportToCSV(activities, label = "activities") {
  const headers = [
    "Date",
    "Type",
    "Duration (hrs)",
    "Duration (min)",
    "Distance (km)",
    "Effort (1-10)",
    "Workout List",
    "Notes",
  ];

  const rows = activities.map((a) => [
    a.date,
    a.type,
    a.duration_hours ?? 0,
    a.duration_minutes ?? 0,
    a.distance ?? "",
    a.effort ?? "",
    // Wrap workout list in quotes and escape any internal quotes
    a.workout_list ? `"${a.workout_list.replace(/"/g, '""')}"` : "",
    a.notes ? `"${a.notes.replace(/"/g, '""')}"` : "",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  // Create a downloadable link and click it automatically
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `grind-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Filter helpers used by the summary panels
export function getWeekActivities(activities, date = new Date()) {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return activities.filter((a) => a.date >= fmt(start) && a.date <= fmt(end));
}

export function getMonthActivities(activities, date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return activities.filter((a) => a.date.startsWith(`${y}-${m}`));
}

export function computeStats(acts) {
  const runDist = acts
    .filter((a) => a.type === "run")
    .reduce((s, a) => s + (a.distance ?? 0), 0);
  const cycleDist = acts
    .filter((a) => a.type === "cycle")
    .reduce((s, a) => s + (a.distance ?? 0), 0);
  const gymCount = acts.filter((a) => a.type === "gym").length;
  const totalMin = acts.reduce(
    (s, a) => s + (a.duration_hours ?? 0) * 60 + (a.duration_minutes ?? 0),
    0,
  );
  const activeDays = new Set(
    acts.filter((a) => a.type !== "rest").map((a) => a.date),
  ).size;
  return { runDist, cycleDist, gymCount, totalMin, activeDays };
}
