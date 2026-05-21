import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import activitiesRouter from "./routes/activities.js";
import stravaRouter from "./routes/strava.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/activities", activitiesRouter);
app.use("/api/strava", stravaRouter);

app.listen(3001, () => console.log("API running on port 3001"));
