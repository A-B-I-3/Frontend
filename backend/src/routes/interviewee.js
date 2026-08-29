import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";
import { issueVerificationCode, verifyCode } from "../utils/verification.js";
import { issueToken, requireAuth } from "../middleware/auth.js";

const router = Router();

const uploadsDir = path.join(process.cwd(), "src", "uploads", "interviewees");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB/file — flagged assumption, confirm real cap
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ---- Step 1: Profile ----
router.post("/profile", async (req, res) => {
  const { jina, namba_ya_simu, barua_pepe } = req.body;
  if (!jina || !namba_ya_simu || !barua_pepe) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const existing = await pool.query(
      `SELECT id, barua_pepe_imethibitishwa FROM interviewees WHERE barua_pepe = $1`,
      [barua_pepe]
    );

    let intervieweeId;
    if (existing.rows.length) {
      intervieweeId = existing.rows[0].id;
      await pool.query(
        `UPDATE interviewees SET jina = $1, namba_ya_simu = $2 WHERE id = $3`,
        [jina, namba_ya_simu, intervieweeId]
      );
    } else {
      const { rows } = await pool.query(
        `INSERT INTO interviewees (jina, namba_ya_simu, barua_pepe) VALUES ($1, $2, $3) RETURNING id`,
        [jina, namba_ya_simu, barua_pepe]
      );
      intervieweeId = rows[0].id;
    }

    const { cooldownSeconds } = await issueVerificationCode({
      ownerType: "interviewee",
      ownerId: intervieweeId,
      email: barua_pepe,
    });

    res.json({ intervieweeId, cooldownSeconds });
  } catch (err) {
    if (err.code === "COOLDOWN") return res.status(429).json({ error: "cooldown", message: err.message });
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/profile/resend-code", async (req, res) => {
  const { intervieweeId } = req.body;
  try {
    const { rows } = await pool.query(`SELECT barua_pepe FROM interviewees WHERE id = $1`, [intervieweeId]);
    if (!rows.length) return res.status(404).json({ error: "not_found" });

    const { cooldownSeconds } = await issueVerificationCode({
      ownerType: "interviewee",
      ownerId: intervieweeId,
      email: rows[0].barua_pepe,
    });
    res.json({ cooldownSeconds });
  } catch (err) {
    if (err.code === "COOLDOWN") return res.status(429).json({ error: "cooldown", message: err.message });
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/profile/verify", async (req, res) => {
  const { intervieweeId, code } = req.body;
  const result = await verifyCode({ ownerType: "interviewee", ownerId: intervieweeId, submittedCode: code });
  if (!result.ok) return res.status(400).json({ error: result.reason });

  await pool.query(
    `UPDATE interviewees SET barua_pepe_imethibitishwa = TRUE, onboarding_step = 2 WHERE id = $1`,
    [intervieweeId]
  );

  const { rows } = await pool.query(`SELECT * FROM interviewees WHERE id = $1`, [intervieweeId]);
  const token = issueToken({ type: "interviewee", id: intervieweeId });
  res.json({ token, interviewee: rows[0] });
});

// ---- Step 2: Education & Skills (requires verified email) ----
router.post("/education-skills", requireAuth("interviewee"), async (req, res) => {
  const { kiwango_cha_elimu, sekta, taaluma, ujuzi, utaalamu, uzoefu } = req.body;

  if (!kiwango_cha_elimu || !sekta || !taaluma || !utaalamu || !uzoefu) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (!Array.isArray(ujuzi) || ujuzi.length < 1 || ujuzi.length > 5) {
    return res.status(400).json({ error: "invalid_skills_count" }); // max 5, min 1
  }

  await pool.query(
    `UPDATE interviewees
     SET kiwango_cha_elimu = $1, sekta = $2, taaluma = $3, ujuzi = $4,
         utaalamu = $5, uzoefu = $6, onboarding_step = 3
     WHERE id = $7`,
    [kiwango_cha_elimu, sekta, taaluma, ujuzi, utaalamu, uzoefu, req.user.id]
  );

  res.json({ ok: true });
});

// ---- Step 3: Documents (requires step 2 complete) ----
router.post("/documents", requireAuth("interviewee"), upload.array("documents", 10), async (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: "no_files" });
  }

  const { rows: intervieweeRows } = await pool.query(
    `SELECT onboarding_step FROM interviewees WHERE id = $1`,
    [req.user.id]
  );
  if (!intervieweeRows.length || intervieweeRows[0].onboarding_step < 3) {
    return res.status(403).json({ error: "step_locked" });
  }

  const inserted = [];
  for (const file of req.files) {
    const { rows } = await pool.query(
      `INSERT INTO interviewee_documents (interviewee_id, file_name, file_path, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, file_name`,
      [req.user.id, file.originalname, file.path, file.mimetype, file.size]
    );
    inserted.push(rows[0]);
  }

  await pool.query(
    `UPDATE interviewees SET onboarding_step = 4, hali_ya_uthibitisho = 'inasubiri' WHERE id = $1`,
    [req.user.id]
  );

  res.json({ ok: true, documents: inserted, hali_ya_uthibitisho: "inasubiri" });
});

// ---- Step 4: Matched interview list ----
router.get("/interviews/matched", requireAuth("interviewee"), async (req, res) => {
  const { rows: intervieweeRows } = await pool.query(`SELECT * FROM interviewees WHERE id = $1`, [req.user.id]);
  if (!intervieweeRows.length) return res.status(404).json({ error: "not_found" });
  const interviewee = intervieweeRows[0];

  // Match on sector + profession as the primary filter; education level as a secondary
  // signal. Flagged assumption: no manual search/filter UI — this is fully automatic.
  const { rows: interviews } = await pool.query(
    `SELECT i.*, iv.jina_la_kampuni
     FROM interviews i
     JOIN interviewers iv ON iv.id = i.interviewer_id
     WHERE i.sekta = $1 AND i.taaluma = $2
     ORDER BY i.created_at DESC`,
    [interviewee.sekta, interviewee.taaluma]
  );

  res.json({ interviews });
});

router.post("/interviews/:interviewId/start", requireAuth("interviewee"), async (req, res) => {
  const { interviewId } = req.params;
  const { rows } = await pool.query(
    `INSERT INTO interview_sessions (interview_id, interviewee_id) VALUES ($1, $2) RETURNING id`,
    [interviewId, req.user.id]
  );
  res.json({ sessionId: rows[0].id });
});

router.post("/interview-sessions/:sessionId/complete", requireAuth("interviewee"), async (req, res) => {
  const { sessionId } = req.params;
  await pool.query(
    `UPDATE interview_sessions SET status = 'imekamilika', completed_at = now()
     WHERE id = $1 AND interviewee_id = $2`,
    [sessionId, req.user.id]
  );
  res.json({ ok: true });
});

export default router;
