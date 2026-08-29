import { createContext, useContext, useState, type ReactNode } from 'react'

type OnboardingContextValue = {
  intervieweeId: number | null
  setIntervieweeId: (id: number | null) => void
  interviewerId: number | null
  setInterviewerId: (id: number | null) => void
  interviewerStagingToken: string | null
  setInterviewerStagingToken: (token: string | null) => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [intervieweeId, setIntervieweeId] = useState<number | null>(null)
  const [interviewerId, setInterviewerId] = useState<number | null>(null)
  const [interviewerStagingToken, setInterviewerStagingToken] = useState<string | null>(null)

  const value: OnboardingContextValue = {
    intervieweeId,
    setIntervieweeId,
    interviewerId,
    setInterviewerId,
    interviewerStagingToken,
    setInterviewerStagingToken,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
