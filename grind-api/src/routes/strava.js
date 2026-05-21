// src/routes/strava.js (backend)
import { Router } from "express";
import axios from "axios";
const router = Router();

// Step 1: Redirect user to Strava login
router.get("/connect", (req, res) => {
  const url =
    "https://www.strava.com/oauth/authorize?" +
    new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID,
      redirect_uri: process.env.STRAVA_REDIRECT_URI,
      response_type: "code",
      scope: "activity:read_all",
    });
  res.redirect(url);
});

// Step 2: Handle the callback and exchange code for token
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  const { data } = await axios.post("https://www.strava.com/oauth/token", {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
  });
  // Save tokens to Supabase profiles table for this user
  // Then redirect back to the dashboard
  res.redirect(process.env.FRONTEND_URL + "?strava=connected");
});

export default router;
