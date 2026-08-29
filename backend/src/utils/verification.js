import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { sendVerificationEmail } from "./mailer.js";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

/**
 * Creates a new verification code for an owner (interviewee or interviewer stage),
 * enforcing the resend cooldown, and emails it via the mailer stub.
 * ownerType: 'interviewee' | 'interviewer_company' | 'interviewer_personal'
 */
export async function issueVerificationCode({ ownerType, ownerId, email }) {
  const { rows: recent } = await pool.query(
    `SELECT created_at FROM verification_codes
     WHERE owner_type = $1 AND owner_id = $2 AND consumed = FALSE
     ORDER BY created_at DESC LIMIT 1`,
    [ownerType, ownerId]
  );

  if (recent.length) {
    const secondsSince = (Date.now() - new Date(recent[0].created_at).getTime()) / 1000;
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince);
      const err = new Error(`Tafadhali subiri sekunde ${wait} kabla ya kuomba tena.`);
      err.code = "COOLDOWN";
      err.retryAfterSeconds = wait;
      throw err;
    }
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await pool.query(
    `INSERT INTO verification_codes (owner_type, owner_id, email, code_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [ownerType, ownerId, email, codeHash, expiresAt]
  );

  await sendVerificationEmail(email, code);
  return { expiresAt, cooldownSeconds: RESEND_COOLDOWN_SECONDS };
}

/**
 * Verifies a submitted code against the most recent unconsumed code for this owner.
 * Returns { ok: true } or { ok: false, reason: 'expired' | 'invalid' | 'too_many_attempts' | 'not_found' }
 */
export async function verifyCode({ ownerType, ownerId, submittedCode }) {
  const { rows } = await pool.query(
    `SELECT * FROM verification_codes
     WHERE owner_type = $1 AND owner_id = $2 AND consumed = FALSE
     ORDER BY created_at DESC LIMIT 1`,
    [ownerType, ownerId]
  );

  if (!rows.length) return { ok: false, reason: "not_found" };
  const record = rows[0];

  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const matches = await bcrypt.compare(submittedCode, record.code_hash);

  if (!matches) {
    await pool.query(
      `UPDATE verification_codes SET attempts = attempts + 1 WHERE id = $1`,
      [record.id]
    );
    return { ok: false, reason: "invalid" };
  }

  await pool.query(`UPDATE verification_codes SET consumed = TRUE WHERE id = $1`, [record.id]);
  return { ok: true };
}
