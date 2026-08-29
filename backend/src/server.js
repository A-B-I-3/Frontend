import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import intervieweeRoutes from "./routes/interviewee.js";
import interviewerRoutes from "./routes/interviewer.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));

app.use("/api/interviewee", intervieweeRoutes);
app.use("/api/interviewer", interviewerRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
