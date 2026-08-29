import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import client from '../../api/client'
import { useOnboarding } from '../../context/OnboardingContext'
import { useAuth } from '../../context/AuthContext'
import CodeInput from '../../components/CodeInput'

export function CandidateWizardVerify() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { email?: string } }
  const { intervieweeId } = useOnboarding()
  const { login } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  async function handleComplete(code: string) {
    setError(null)
    try {
      const { data } = await client.post('/interviewee/profile/verify', { intervieweeId, code })
      login(data.token, data.interviewee, 'interviewee')
      navigate('/candidate/register/education')
    } catch (err: any) {
      const reason = err?.response?.data?.error
      setError(
        reason === 'expired'
          ? t('wizard.verify.codeExpired', 'This code has expired. Request a new one.')
          : reason === 'too_many_attempts'
          ? t('wizard.verify.tooManyAttempts', 'Too many attempts. Request a new code.')
          : t('wizard.verify.codeIncorrect', "That code isn't right. Try again.")
      )
    }
  }

  async function handleResend() {
    try {
      const { data } = await client.post('/interviewee/profile/resend-code', { intervieweeId })
      setCooldown(data.cooldownSeconds)
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) clearInterval(interval)
          return c - 1
        })
      }, 1000)
    } catch {
      setError(t('common.error', 'Something went wrong. Please try again.'))
    }
  }

  if (!intervieweeId) {
    // Guard: this step is unreachable without a profile already submitted.
    navigate('/candidate/register/profile', { replace: true })
    return null
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-on-surface">{t('wizard.verify.title', 'Verify your email')}</h1>
      <p className="mt-2 text-on-surface-variant">
        {t('wizard.verify.instructions', 'We sent a 6-digit code to {{email}}', { email: state?.email })}
      </p>

      <div className="mt-6">
        <CodeInput onComplete={handleComplete} />
      </div>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      <button onClick={handleResend} disabled={cooldown > 0} className="mt-6 text-sm font-semibold text-primary disabled:text-on-surface-variant">
        {cooldown > 0 ? t('wizard.verify.resendIn', 'Resend in {{seconds}}s', { seconds: cooldown }) : t('wizard.verify.resend', 'Resend code')}
      </button>
    </div>
  )
}
