import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import WizardProgress from '../../components/WizardProgress'
import { useAuth } from '../../context/AuthContext'
import { subscriptionPlans } from '../../data/wizardData'

export function CompanyWizardSubscription() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (!selected) return
    setSubmitting(true)
    setError(null)
    try {
      await client.post('/interviewer/subscription', { planId: selected })
      navigate('/company/dashboard')
    } catch {
      setError(t('common.error', 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    navigate('/company/register/profile', { replace: true })
    return null
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('auth.company', 'Company')}</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('wizard.subscription.title', 'Choose a subscription plan')}</h1>
      </div>

      <WizardProgress
        labels={[
          t('wizard.steps.companyProfile', 'Company Profile'),
          t('wizard.steps.personalProfile', 'Personal Profile'),
          t('wizard.steps.subscription', 'Subscription'),
        ]}
        currentIndex={2}
      />

      <div className="rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md">
        <div className="space-y-2">
          {subscriptionPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left font-semibold ${
                selected === plan.id ? 'border-primary bg-primary/5' : 'border-outline-variant'
              }`}
            >
              {t(plan.labelKey, plan.id)}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={!selected || submitting}
          className="btn btn-primary mt-6 w-full disabled:opacity-50"
        >
          {t('wizard.subscription.confirm', 'Confirm subscription')}
        </button>
      </div>
    </div>
  )
}
