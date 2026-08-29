// STUB: logs the "email" to the console instead of sending one.
// Swap this out for a real provider (SES / SendGrid / Postmark / etc.) before production.
// Keep the function signature the same so nothing else in the app has to change.

export async function sendVerificationEmail(to, code) {
  console.log(`[mailer stub] Verification code for ${to}: ${code}`);
  return true;
}
