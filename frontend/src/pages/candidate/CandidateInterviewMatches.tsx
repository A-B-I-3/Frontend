import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import { useAuth } from '../../context/AuthContext'

type Interview = {
  id: number
  title: string
  jina_la_kampuni: string
  taaluma: string
}

export function CandidateInterviewMatches() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<{ sessionId: number; title: string } | null>(null)
  const [showContinuePrompt, setShowContinuePrompt] = useState(false)

  async function loadInterviews() {
    setLoading(true)
    try {
      const { data } = await client.get('/interviewee/interviews/matched')
      setInterviews(data.interviews)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInterviews()
  }, [])

  async function startInterview(interview: Interview) {
    const { data } = await client.post(`/interviewee/interviews/${interview.id}/start`)
    setActiveSession({ sessionId: data.sessionId, title: interview.title })
  }

  async function completeInterview() {
    if (!activeSession) return
    await client.post(`/interviewee/interview-sessions/${activeSession.sessionId}/complete`)
    setShowContinuePrompt(true)
  }

  function handleContinue(shouldContinue: boolean) {
    setShowContinuePrompt(false)
    setActiveSession(null)
    if (shouldContinue) loadInterviews()
    else navigate('/candidate/dashboard')
  }

  if (!user) {
    navigate('/candidate/register/profile', { replace: true })
    return null
  }

  if (activeSession) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        {!showContinuePrompt ? (
          <>
            <h1 className="text-xl font-bold text-on-surface">{activeSession.title}</h1>
            {/* The live AI-driven interview experience (video/questions/scoring) plugs in
                here — out of scope for this wizard, see Copilot's existing InterviewPage
                for the mocked UI. This button simulates the session ending. */}
            <button onClick={completeInterview} className="btn btn-primary mt-6">
              {t('wizard.interviews.finish', 'Finish interview')}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-on-surface">{t('wizard.interviews.sessionComplete', 'Interview complete')}</h2>
            <p className="mt-2 text-on-surface-variant">
              {t('wizard.interviews.continuePrompt', 'Would you like to continue with another interview?')}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => handleContinue(true)} className="btn btn-primary">
                {t('wizard.interviews.continueBtn', 'Continue with more')}
              </button>
              <button onClick={() => handleContinue(false)} className="btn btn-secondary">
                {t('wizard.interviews.stopBtn', "No, I'm done")}
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">{t('wizard.interviews.title', 'Interviews matched for you')}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t('wizard.interviews.matchedOn', 'Matched to your profession and education')}
        </p>
      </div>

      {loading ? (
        <p className="text-on-surface-variant">{t('common.loading', 'Loading...')}</p>
      ) : interviews.length === 0 ? (
        <p className="text-on-surface-variant">{t('wizard.interviews.noResults', 'No matching interviews right now. Check back later.')}</p>
      ) : (
        <ul className="space-y-3">
          {interviews.map((interview) => (
            <li
              key={interview.id}
              className="flex items-center justify-between rounded-[20px] border border-white/40 bg-white/80 p-4 shadow-soft backdrop-blur-md"
            >
              <div>
                <p className="font-semibold text-on-surface">{interview.title}</p>
                <p className="text-sm text-on-surface-variant">
                  {interview.jina_la_kampuni} — {interview.taaluma}
                </p>
              </div>
              <button onClick={() => startInterview(interview)} className="btn btn-primary">
                {t('wizard.interviews.start', 'Start interview')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
