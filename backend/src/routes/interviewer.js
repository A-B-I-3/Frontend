import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { issueVerificationCode, verifyCode } from "../utils/verification.js";
import { issueToken, requireAuth } from "../middleware/auth.js";

const router = Router();

// Flagged assumption: real pricing/tiers TBD — placeholders only, do not ship to
// production without confirming these against the actual subscription plans.
const PLANS = [
  { id: "monthly", duration_days: 30 },
  { id: "quarterly", duration_days: 90 },
  { id: "annual", duration_days: 365 },
];

// ---- Stage 1: Company profile ----
router.post("/company-profile", async (req, res) => {
  const { jina_la_kampuni, barua_pepe_ya_kampuni } = req.body;
  if (!jina_la_kampuni || !barua_pepe_ya_kampuni) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM interviewers WHERE barua_pepe_ya_kampuni = $1`,
      [barua_pepe_ya_kampuni]
    );

    let interviewerId;
    if (existing.rows.length) {
      interviewerId = existing.rows[0].id;
      await pool.query(`UPDATE interviewers SET jina_la_kampuni = $1 WHERE id = $2`, [
        jina_la_kampuni,
        interviewerId,
      ]);
    } else {
      const { rows } = await pool.query(
        `INSERT INTO interviewers (jina_la_kampuni, barua_pepe_ya_kampuni) VALUES ($1, $2) RETURNING id`,
        [jina_la_kampuni, barua_pepe_ya_kampuni]
      );
      interviewerId = rows[0].id;
    }

    const { cooldownSeconds } = await issueVerificationCode({
      ownerType: "interviewer_company",
      ownerId: interviewerId,
      email: barua_pepe_ya_kampuni,
    });

    res.json({ interviewerId, cooldownSeconds });
  } catch (err) {
    if (err.code === "COOLDOWN") return res.status(429).json({ error: "cooldown", message: err.message });
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/company-profile/resend-code", async (req, res) => {
  const { interviewerId } = req.body;
  const { rows } = await pool.query(`SELECT barua_pepe_ya_kampuni FROM interviewers WHERE id = $1`, [
    interviewerId,
  ]);
  if (!rows.length) return res.status(404).json({ error: "not_found" });

  try {
    const { cooldownSeconds } = await issueVerificationCode({
      ownerType: "interviewer_company",
      ownerId: interviewerId,
      email: rows[0].barua_pepe_ya_kampuni,
    });
    res.json({ cooldownSeconds });
  } catch (err) {
    if (err.code === "COOLDOWN") return res.status(429).json({ error: "cooldown", message: err.message });
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/company-profile/verify", async (req, res) => {
  const { interviewerId, code } = req.body;
  const result = await verifyCode({ ownerType: "interviewer_company", ownerId: interviewerId, submittedCode: code });
  if (!result.ok) return res.status(400).json({ error: result.reason });

  await pool.query(
    `UPDATE interviewers SET barua_pepe_ya_kampuni_imethibitishwa = TRUE, onboarding_step = 2 WHERE id = $1`,
    [interviewerId]
  );

  // Short-lived staging token: proves company-email verification, not full auth yet
  // (full auth token is issued after personal-profile verification below).
  const stagingToken = issueToken({ type: "interviewer_staging", id: interviewerId });
  res.json({ stagingToken });
});

// ---- Stage 2: Personal profile (requires company-email verified) ----
router.post("/personal-profile", requireAuth("interviewer_staging"), async (req, res) => {
  const { jina, barua_pepe_binafsi, nenosiri, thibitisha_nenosiri } = req.body;

  if (!jina || !barua_pepe_binafsi || !nenosiri || !thibitisha_nenosiri) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (nenosiri !== thibitisha_nenosiri) {
    return res.status(400).json({ error: "password_mismatch" });
  }
  if (nenosiri.length < 8 || !/\d/.test(nenosiri)) {
    // Flagged assumption: 8+ chars with at least one number — confirm real policy.
    return res.status(400).json({ error: "weak_password" });
  }

  const { rows: companyRows } = await pool.query(
    `SELECT barua_pepe_ya_kampuni FROM interviewers WHERE id = $1`,
    [req.user.id]
  );
  if (companyRows[0].barua_pepe_ya_kampuni === barua_pepe_binafsi) {
    return res.status(400).json({ error: "personal_email_must_differ_from_company_email" });
  }

  const nenosiriHash = await bcrypt.hash(nenosiri, 10);

  await pool.query(
    `UPDATE interviewers SET jina = $1, barua_pepe_binafsi = $2, nenosiri_hash = $3 WHERE id = $4`,
    [jina, barua_pepe_binafsi, nenosiriHash, req.user.id]
  );

  const { cooldownSeconds } = await issueVerificationCode({
    ownerType: "interviewer_personal",
    ownerId: req.user.id,
    email: barua_pepe_binafsi,
  });

  res.json({ cooldownSeconds });
});

router.post("/personal-profile/resend-code", requireAuth("interviewer_staging"), async (req, res) => {
  const { rows } = await pool.query(`SELECT barua_pepe_binafsi FROM interviewers WHERE id = $1`, [req.user.id]);
  try {
    const { cooldownSeconds } = await issueVerificationCode({
      ownerType: "interviewer_personal",
      ownerId: req.user.id,
      email: rows[0].barua_pepe_binafsi,
    });
    res.json({ cooldownSeconds });
  } catch (err) {
    if (err.code === "COOLDOWN") return res.status(429).json({ error: "cooldown", message: err.message });
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/personal-profile/verify", requireAuth("interviewer_staging"), async (req, res) => {
  const { code } = req.body;
  const result = await verifyCode({ ownerType: "interviewer_personal", ownerId: req.user.id, submittedCode: code });
  if (!result.ok) return res.status(400).json({ error: result.reason });

  await pool.query(
    `UPDATE interviewers SET barua_pepe_binafsi_imethibitishwa = TRUE, onboarding_step = 3 WHERE id = $1`,
    [req.user.id]
  );

  const { rows } = await pool.query(`SELECT * FROM interviewers WHERE id = $1`, [req.user.id]);
  const token = issueToken({ type: "interviewer", id: req.user.id });
  res.json({ token, interviewer: rows[0] });
});

// ---- Stage 3: Subscription (requires full auth = both verifications done) ----
router.get("/subscription/plans", requireAuth("interviewer"), (req, res) => {
  res.json({ plans: PLANS });
});

router.post("/subscription", requireAuth("interviewer"), async (req, res) => {
  const { planId } = req.body;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return res.status(400).json({ error: "invalid_plan" });

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

  await pool.query(
    `UPDATE interviewers
     SET subscription_plan = $1, subscription_started_at = $2, subscription_expires_at = $3, onboarding_step = 4
     WHERE id = $4`,
    [plan.id, startedAt, expiresAt, req.user.id]
  );

  res.json({ ok: true, plan: plan.id, expiresAt });
});

export default router;
