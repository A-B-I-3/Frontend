import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import Field from '../../components/Field'
import WizardProgress from '../../components/WizardProgress'
import { useAuth } from '../../context/AuthContext'
import { educationLevels, experienceRanges, sectorProfessionMap, skillMap } from '../../data/wizardData'

export function CandidateWizardEducation() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    kiwango_cha_elimu: '',
    sekta: '',
    taaluma: '',
    ujuzi: [] as string[],
    utaalamu: '',
    uzoefu: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const professionOptions = useMemo(() => sectorProfessionMap[form.sekta] || [], [form.sekta])
  const skillOptions = useMemo(() => skillMap[form.sekta] || [], [form.sekta])

  function toggleSkill(skill: string) {
    setForm((f) => {
      const has = f.ujuzi.includes(skill)
      if (has) return { ...f, ujuzi: f.ujuzi.filter((s) => s !== skill) }
      if (f.ujuzi.length >= 5) return f // enforce max 5 in the UI, not just on submit
      return { ...f, ujuzi: [...f.ujuzi, skill] }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await client.post('/interviewee/education-skills', form)
      navigate('/candidate/register/documents')
    } catch {
      setError(t('common.error', 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    navigate('/candidate/register/profile', { replace: true })
    return null
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('auth.candidate', 'Candidate')}</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('wizard.education.title', 'Education & Skills')}</h1>
      </div>

      <WizardProgress
        labels={[t('wizard.steps.profile', 'Profile'), t('wizard.steps.education', 'Education & Skills'), t('wizard.steps.documents', 'Documents')]}
        currentIndex={1}
      />

      <form
        className="grid gap-5 rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md lg:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <Field label={t('forms.education', 'Education level')}>
          <select
            required
            className="field"
            value={form.kiwango_cha_elimu}
            onChange={(e) => setForm({ ...form, kiwango_cha_elimu: e.target.value })}
          >
            <option value="">{t('wizard.selectPlaceholder', 'Select...')}</option>
            {educationLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('forms.sector', 'Work sector')}>
          <select
            required
            className="field"
            value={form.sekta}
            onChange={(e) => setForm({ ...form, sekta: e.target.value, taaluma: '', ujuzi: [] })}
          >
            <option value="">{t('wizard.selectPlaceholder', 'Select...')}</option>
            {Object.keys(sectorProfessionMap).map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('forms.profession', 'Profession / job title')}>
          <select
            required
            disabled={!form.sekta}
            className="field"
            value={form.taaluma}
            onChange={(e) => setForm({ ...form, taaluma: e.target.value })}
          >
            <option value="">{t('wizard.selectPlaceholder', 'Select...')}</option>
            {professionOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('wizard.education.specialization', 'Specialization')}>
          <input
            required
            className="field"
            value={form.utaalamu}
            onChange={(e) => setForm({ ...form, utaalamu: e.target.value })}
          />
        </Field>

        <Field
          label={`${t('forms.skills', 'Skills')} — ${t('wizard.education.skillsCount', '{{count}}/5 selected', { count: form.ujuzi.length })}`}
          className="lg:col-span-2"
        >
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => {
              const selected = form.ujuzi.includes(skill)
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  disabled={!selected && form.ujuzi.length >= 5}
                  className={`rounded-full border-2 px-3 py-1.5 text-sm disabled:opacity-40 ${
                    selected ? 'border-secondary bg-secondary text-white' : 'border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {skill}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label={t('forms.experienceYears', 'Years of experience')}>
          <select
            required
            className="field"
            value={form.uzoefu}
            onChange={(e) => setForm({ ...form, uzoefu: e.target.value })}
          >
            <option value="">{t('wizard.selectPlaceholder', 'Select...')}</option>
            {experienceRanges.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        {error && <p className="text-sm text-error lg:col-span-2">{error}</p>}

        <div className="flex justify-end gap-3 lg:col-span-2">
          <button
            type="submit"
            disabled={submitting || form.ujuzi.length === 0}
            className="btn btn-primary disabled:opacity-50"
          >
            {t('forms.continue', 'Continue')}
          </button>
        </div>
      </form>
    </div>
  )
}
