import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import client from '../../api/client'
import { useOnboarding } from '../../context/OnboardingContext'
import Field from '../../components/Field'
import WizardProgress from '../../components/WizardProgress'

export function CompanyWizardProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setInterviewerId } = useOnboarding()

  const [form, setForm] = useState({ jina_la_kampuni: '', barua_pepe_ya_kampuni: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { data } = await client.post('/interviewer/company-profile', form)
      setInterviewerId(data.interviewerId)
      navigate('/company/register/verify-company', { state: { email: form.barua_pepe_ya_kampuni } })
    } catch {
      setError(t('common.error', 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('auth.company', 'Company')}</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('wizard.company.profileTitle', 'Company profile')}</h1>
      </div>

      <WizardProgress
        labels={[
          t('wizard.steps.companyProfile', 'Company Profile'),
          t('wizard.steps.personalProfile', 'Personal Profile'),
          t('wizard.steps.subscription', 'Subscription'),
        ]}
        currentIndex={0}
      />

      <form
        className="grid gap-5 rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md"
        onSubmit={handleSubmit}
      >
        <Field label={t('forms.companyName', 'Company name')}>
          <input
            required
            className="field"
            value={form.jina_la_kampuni}
            onChange={(e) => setForm({ ...form, jina_la_kampuni: e.target.value })}
          />
        </Field>
        <Field label={t('forms.companyEmail', 'Company email')}>
          <input
            required
            type="email"
            className="field"
            value={form.barua_pepe_ya_kampuni}
            onChange={(e) => setForm({ ...form, barua_pepe_ya_kampuni: e.target.value })}
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
