// src/routes/activities.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createClient } from "@supabase/supabase-js";

const router = Router();
router.use(requireAuth);

// GET all activities for the logged-in user
router.get("/", async (req, res) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
  );
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// POST create new activity
router.post("/", async (req, res) => {
  const { date, type, duration, distance, effort, sets, notes } = req.body;
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
  );
  const { data, error } = await supabase
    .from("activities")
    .insert([
      {
        user_id: req.user.id,
        date,
        type,
        duration,
        distance,
        effort,
        sets,
        notes,
      },
    ])
    .select();
  if (error) return res.status(500).json({ error });
  res.status(201).json(data[0]);
});

export default router;
