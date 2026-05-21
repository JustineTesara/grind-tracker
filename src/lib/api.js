import { supabase } from "./supabase";

// ── Fetch all activities for the logged-in user ──
export async function getActivities(userId) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

// ── Save a new activity ──
export async function createActivity(activity) {
  const { data, error } = await supabase
    .from("activities")
    .insert([activity])
    .select();
  if (error) throw error;
  return data[0];
}

// ── Delete an activity by ID ──
export async function deleteActivity(id) {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
}

// ── Update an existing activity ──
export async function updateActivity(id, updates) {
  const { data, error } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
}
