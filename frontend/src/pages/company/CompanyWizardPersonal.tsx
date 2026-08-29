import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import { useOnboarding } from '../../context/OnboardingContext'
import Field from '../../components/Field'
import WizardProgress from '../../components/WizardProgress'

export function CompanyWizardPersonal() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { interviewerStagingToken } = useOnboarding()

  const [form, setForm] = useState({
    jina: '',
    barua_pepe_binafsi: '',
    nenosiri: '',
    thibitisha_nenosiri: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.nenosiri !== form.thibitisha_nenosiri) {
      setError(t('wizard.personal.passwordMismatch', "Passwords don't match"))
      return
    }

    setSubmitting(true)
    try {
      await client.post('/interviewer/personal-profile', form)
      navigate('/company/register/verify-personal', { state: { email: form.barua_pepe_binafsi } })
    } catch (err: any) {
      const reason = err?.response?.data?.error
      if (reason === 'weak_password') setError(t('wizard.personal.weakPassword', 'Password needs at least 8 characters and one number'))
      else if (reason === 'personal_email_must_differ_from_company_email')
        setError(t('wizard.personal.emailMustDiffer', 'Personal email must differ from company email'))
      else setError(t('common.error', 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!interviewerStagingToken) {
    navigate('/company/register/profile', { replace: true })
    return null
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('auth.company', 'Company')}</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('wizard.personal.title', 'Your personal profile')}</h1>
      </div>

      <WizardProgress
        labels={[
          t('wizard.steps.companyProfile', 'Company Profile'),
          t('wizard.steps.personalProfile', 'Personal Profile'),
          t('wizard.steps.subscription', 'Subscription'),
        ]}
        currentIndex={1}
      />

      <form
        className="grid gap-5 rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md"
        onSubmit={handleSubmit}
      >
        <Field label={t('forms.adminName', 'Full name')}>
          <input required className="field" value={form.jina} onChange={(e) => setForm({ ...form, jina: e.target.value })} />
        </Field>
        <Field label={t('forms.personalEmail', 'Personal email')}>
          <input
            required
            type="email"
            className="field"
            value={form.barua_pepe_binafsi}
            onChange={(e) => setForm({ ...form, barua_pepe_binafsi: e.target.value })}
          />
        </Field>
        <Field label={t('forms.password', 'Password')}>
          <input
            required
            type="password"
            className="field"
            value={form.nenosiri}
            onChange={(e) => setForm({ ...form, nenosiri: e.target.value })}
          />
        </Field>
        <Field label={t('wizard.personal.confirmPassword', 'Confirm password')}>
          <input
            required
            type="password"
            className="field"
            value={form.thibitisha_nenosiri}
            onChange={(e) => setForm({ ...form, thibitisha_nenosiri: e.target.value })}
          />
        </Field>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">
            {t('forms.continue', 'Continue')}
          </button>
        </div>
      </form>
    </div>
  )
}
