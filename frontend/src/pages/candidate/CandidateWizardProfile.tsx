import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import client from '../../api/client'
import { useOnboarding } from '../../context/OnboardingContext'
import Field from '../../components/Field'
import WizardProgress from '../../components/WizardProgress'

export function CandidateWizardProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setIntervieweeId } = useOnboarding()

  const [form, setForm] = useState({ jina: '', namba_ya_simu: '', barua_pepe: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { data } = await client.post('/interviewee/profile', form)
      setIntervieweeId(data.intervieweeId)
      navigate('/candidate/register/verify', { state: { email: form.barua_pepe } })
    } catch {
      setError(t('common.error', 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('auth.candidate', 'Candidate')}</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('forms.createProfile', 'Create your profile')}</h1>
      </div>

      <WizardProgress
        labels={[t('wizard.steps.profile', 'Profile'), t('wizard.steps.education', 'Education & Skills'), t('wizard.steps.documents', 'Documents')]}
        currentIndex={0}
      />

      <form
        className="grid gap-5 rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md"
        onSubmit={handleSubmit}
      >
        <Field label={t('forms.fullName', 'Full name')}>
          <input required className="field" value={form.jina} onChange={(e) => setForm({ ...form, jina: e.target.value })} />
        </Field>
        <Field label={t('forms.phone', 'Phone')}>
          <input
            required
            className="field"
            value={form.namba_ya_simu}
            onChange={(e) => setForm({ ...form, namba_ya_simu: e.target.value })}
          />
        </Field>
        <Field label={t('forms.email', 'Email')}>
          <input
            required
            type="email"
            className="field"
            value={form.barua_pepe}
            onChange={(e) => setForm({ ...form, barua_pepe: e.target.value })}
          />
        </Field>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link to="/karibu" className="btn btn-secondary">
            {t('forms.back', 'Back')}
          </Link>
          <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">
            {t('forms.continue', 'Continue')}
          </button>
        </div>
      </form>
    </div>
  )
}
