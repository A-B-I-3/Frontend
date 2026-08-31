import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  CirclePlay,
  FileText,
  Globe,
  Mic,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  Video,
} from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OnboardingProvider } from './context/OnboardingContext'
import { CandidateWizardProfile } from './pages/candidate/CandidateWizardProfile'
import { CandidateWizardVerify } from './pages/candidate/CandidateWizardVerify'
import { CandidateWizardEducation } from './pages/candidate/CandidateWizardEducation'
import { CandidateWizardDocuments } from './pages/candidate/CandidateWizardDocuments'
import { CandidateInterviewMatches } from './pages/candidate/CandidateInterviewMatches'
import { CompanyWizardProfile } from './pages/company/CompanyWizardProfile'
import { CompanyWizardVerifyCompany } from './pages/company/CompanyWizardVerifyCompany'
import { CompanyWizardPersonal } from './pages/company/CompanyWizardPersonal'
import { CompanyWizardVerifyPersonal } from './pages/company/CompanyWizardVerifyPersonal'
import { CompanyWizardSubscription } from './pages/company/CompanyWizardSubscription'

const pricingPlans = [
  { name: 'plans.starter', price: 'TZS 0', detail: 'plans.starterDetail', tag: 'plans.starterTag', accent: 'neutral' },
  { name: 'plans.growth', price: 'TZS 50,000', detail: 'plans.growthDetail', tag: 'plans.growthTag', accent: 'primary' },
  { name: 'plans.enterprise', price: 'plans.enterprisePrice', detail: 'plans.enterpriseDetail', tag: 'plans.enterpriseTag', accent: 'accent' },
]

const dashboardCards = [
  { title: 'dashboard.upcomingInterview.title', value: 'dashboard.upcomingInterview.value', meta: 'dashboard.upcomingInterview.meta', icon: Calendar },
  { title: 'dashboard.profileCompletenessCard.title', value: 'dashboard.profileCompletenessCard.value', meta: 'dashboard.profileCompletenessCard.meta', icon: BadgeCheck },
  { title: 'dashboard.documentsVerifiedCard.title', value: 'dashboard.documentsVerifiedCard.value', meta: 'dashboard.documentsVerifiedCard.meta', icon: FileText },
]

const companyMetrics = [
  { title: 'company.openRoles.title', value: 'company.openRoles.value', meta: 'company.openRoles.meta', icon: Users },
  { title: 'company.candidatesReviewed.title', value: 'company.candidatesReviewed.value', meta: 'company.candidatesReviewed.meta', icon: Star },
  { title: 'company.avgScore.title', value: 'company.avgScore.value', meta: 'company.avgScore.meta', icon: ShieldCheck },
]

const faqItems = [
  'faq.questions.0',
  'faq.questions.1',
  'faq.questions.2',
  'faq.questions.3',
]

const transcript = [
  { speaker: 'results.transcript.aiInterviewer', text: 'results.transcript.aiQuestion' },
  { speaker: 'results.transcript.candidate', text: 'results.transcript.candidateAnswer' },
]

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OnboardingProvider>
          <AppRoutes />
        </OnboardingProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/karibu" element={<WelcomePage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Candidate onboarding wizard — gated, backend-connected */}
        <Route path="/candidate/register" element={<Navigate to="/candidate/register/profile" replace />} />
        <Route path="/candidate/register/profile" element={<CandidateWizardProfile />} />
        <Route path="/candidate/register/verify" element={<CandidateWizardVerify />} />
        <Route path="/candidate/register/education" element={<CandidateWizardEducation />} />
        <Route path="/candidate/register/documents" element={<CandidateWizardDocuments />} />
        <Route path="/candidate/interviews" element={<CandidateInterviewMatches />} />

        <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
        <Route path="/candidate/interview" element={<InterviewPage />} />
        <Route path="/candidate/results" element={<ResultsPage />} />

        {/* Company onboarding wizard — gated, backend-connected */}
        <Route path="/company/register" element={<Navigate to="/company/register/profile" replace />} />
        <Route path="/company/register/profile" element={<CompanyWizardProfile />} />
        <Route path="/company/register/verify-company" element={<CompanyWizardVerifyCompany />} />
        <Route path="/company/register/personal" element={<CompanyWizardPersonal />} />
        <Route path="/company/register/verify-personal" element={<CompanyWizardVerifyPersonal />} />
        <Route path="/company/register/subscription" element={<CompanyWizardSubscription />} />

        <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
        <Route path="/company/create-session" element={<CompanySessionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function LandingPage() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeIndustry, setActiveIndustry] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  })

  const industries = [
    {
      name: 'Technology',
      description:
        'Structure technical interviews around problem solving, communication, and product judgment so hiring teams can assess strengths consistently across engineering and product roles.',
    },
    {
      name: 'Finance',
      description:
        'Evaluate risk awareness, decision quality, and customer communication with scenarios designed for banking, fintech, and operations teams.',
    },
    {
      name: 'Healthcare',
      description:
        'Measure empathy, clarity, and compliance awareness in a way that fits clinical, administrative, and support operations.',
    },
    {
      name: 'Sales',
      description:
        'Assess discovery, persuasion, and negotiation skills using realistic customer situations and measurable performance criteria.',
    },
    {
      name: 'Customer Service',
      description:
        'Focus on stakeholder empathy, conflict resolution, and communication quality to identify candidates who can represent your brand with confidence.',
    },
  ]

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newsletterEmail.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setNewsletterStatus({ type: 'success', message: 'You are subscribed. We will be in touch soon.' })
    setNewsletterEmail('')
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-on-surface">
      <header className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">AI</div>
            <div>
              <p className="text-sm font-semibold text-on-surface">TalentFlow AI</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <NavLink to="/#about" className="nav-link">{t('nav.about', 'About')}</NavLink>
            <NavLink to="/#candidates" className="nav-link">{t('nav.candidates', 'Candidates')}</NavLink>
            <NavLink to="/#employers" className="nav-link">{t('nav.employers', 'Employers')}</NavLink>
            <NavLink to="/#how-it-works" className="nav-link">{t('nav.howItWorks', 'How it works')}</NavLink>
            <NavLink to="/#faq" className="nav-link">{t('nav.faq', 'FAQ')}</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/login" className="btn btn-secondary hidden sm:inline-flex">{t('nav.login', 'Login')}</Link>
            <Link to="/karibu" className="btn btn-primary">{t('nav.getStarted', 'Get Started')}</Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <motion.section
          className="relative overflow-hidden rounded-[28px] border border-white/40 bg-[#081525] px-6 py-10 shadow-soft lg:px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1633]/90 via-[#0a1633]/80 to-[#0a1633]/40" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
                {t('hero.eyebrow', 'Smarter hiring starts here')}
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-lg text-4xl font-extrabold leading-tight text-white sm:text-5xl"
              >
                {t('hero.headline', 'Interviews, reimagined with AI.')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-5 max-w-xl text-lg text-slate-200"
              >
                {t(
                  'hero.subheadline',
                  'Create fair, structured interviews that help candidates show their full potential and help teams hire with more confidence.',
                )}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link to="/karibu" className="btn bg-secondary text-white hover:brightness-110 active:scale-95">
                  {t('hero.candidate', 'Get Started')}
                </Link>
                <Link to="/karibu" className="btn border border-white/30 bg-white/10 text-white hover:bg-white/15 active:scale-95">
                  {t('hero.employer', "I'm Hiring")}
                </Link>
              </motion.div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-200">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> {t('hero.badge', 'Structured, fair evaluation')}</div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-secondary" /> {t('hero.localised', 'English and Swahili ready')}</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-4 text-white shadow-soft backdrop-blur-md">
                <div className="rounded-[20px] bg-slate-950/75 p-4">
                  <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-success" />
                      {t('common.live', 'Session live')}
                    </div>
                    <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-secondary">
                      {t('common.aiReview', 'AI review')}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                      <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
                        <span>{t('common.interviewAudio', 'Interview audio')}</span>
                        <span>01:42</span>
                      </div>
                      <div className="flex h-24 items-end gap-1">
                        {[38, 62, 42, 74, 68, 88, 56, 72, 52, 82, 60, 48].map((height, index) => (
                          <span
                            key={index}
                            className="w-full rounded-t-md bg-gradient-to-t from-primary to-secondary"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{t('common.question', 'Question')}</p>
                        <p className="mt-2 text-2xl font-bold text-white">03</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{t('common.focus', 'Focus')}</p>
                        <p className="mt-2 text-base font-semibold text-secondary">{t('common.communication', 'Communication')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-200 animate-bounce">↓</div>
        </motion.section>

        <Section id="about" title={t('about.title', 'Who we are')} description={t('about.description', 'A fair, human-first interview platform built for modern hiring teams.') }>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
              <div className="glass-card rounded-2xl p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('about.eyebrow', 'Why it matters')}</p>
                <h3 className="mt-3 text-2xl font-bold text-on-surface">{t('about.heading', 'More clarity for candidates. Better decisions for teams.')}</h3>
                <p className="mt-4 text-base leading-7 text-on-surface-variant">
                  {t('about.body', 'Our platform helps organizations run consistent interviews at scale without losing the human side of hiring. Candidates get a structured experience, and recruiters get clear scorecards and actionable feedback.')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  t('about.features.0', 'Structured interview flow'),
                  t('about.features.1', 'Clear candidate feedback'),
                  t('about.features.2', 'Role-based evaluation'),
                  t('about.features.3', 'Scalable hiring process'),
                ].map((item) => (
                  <div key={item} className="glass-card flex items-center gap-3 rounded-xl p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Check className="h-5 w-5" /></div>
                    <p className="font-medium text-on-surface">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-primary/10 shadow-soft"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#091827]/80 via-[#091827]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-100 backdrop-blur-sm">
                  {t('about.statLabel', 'Candidate experience')}
                </div>
                <p className="mt-3 max-w-sm text-2xl font-bold">{t('about.statCopy', 'Interviewing with clarity, confidence, and support.')}</p>
              </div>
            </motion.div>
          </div>
        </Section>

        <Section id="path-selection" title={t('paths.title', 'Choose your path')} description={t('paths.description', 'Start with the experience that matches your goals.') }>
          <div className="grid gap-6 md:grid-cols-2">
            <Link to="/candidate/register" className="group block overflow-hidden rounded-[28px] border border-primary/15 bg-white shadow-soft transition hover:-translate-y-1 hover:border-primary/30">
              <div className="relative h-60 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#072340]/80 via-[#072340]/20 to-transparent" />
                <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-md">
                  <UserRound className="h-6 w-6" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-on-surface">{t('paths.candidateTitle', 'Take the interview')}</h3>
                <p className="mt-3 text-base text-on-surface-variant">
                  {t('paths.candidateDescription', 'Join a structured AI interview and get quick, actionable feedback on your performance.')}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
                  {t('common.learnMore', 'Learn more')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link to="/company/register" className="group block overflow-hidden rounded-[28px] border border-accent/15 bg-white shadow-soft transition hover:-translate-y-1 hover:border-accent/30">
              <div className="relative h-60 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c0d1f]/80 via-[#1c0d1f]/20 to-transparent" />
                <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-accent shadow-md">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-on-surface">{t('paths.employerTitle', 'Create an interview session')}</h3>
                <p className="mt-3 text-base text-on-surface-variant">
                  {t('paths.employerDescription', 'Design hiring sessions, manage roles, and review candidate performance with clarity.')}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
                  {t('common.learnMore', 'Learn more')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </Section>

        <section className="relative mt-20 overflow-hidden rounded-[32px] border border-primary/10 bg-[#f7f9fc] px-4 py-8 sm:px-6 lg:px-8">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle, rgba(19, 90, 173, 0.16) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="relative">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t('common.builtForEveryField', 'Built for every field')}</p>
              <h2 className="mt-3 text-3xl font-bold text-on-surface">{t('common.fieldHeadline', 'Interviews that adapt to the job, not the other way around.')}</h2>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/80 p-4 shadow-soft backdrop-blur-md sm:p-6">
              <div className="mb-6 flex flex-wrap gap-2">
                {industries.map((industry, index) => (
                  <button
                    key={industry.name}
                    type="button"
                    onClick={() => setActiveIndustry(index)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeIndustry === index ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-on-surface-variant hover:bg-primary/5'
                    }`}
                  >
                    {industry.name}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={industries[activeIndustry].name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-base leading-7 text-on-surface-variant">{industries[activeIndustry].description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <Section title={t('common.readyTitle', 'Ready when your team is')} description={t('common.readyDescription', 'From first screening to final shortlist, the experience stays structured and clear.') }>
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-[28px] border border-primary/10 bg-white shadow-soft"
            >
              <div className="h-52 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')" }} />
              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('common.forCandidates', 'For candidates')}</p>
                <h3 className="mt-3 text-2xl font-bold text-on-surface">{t('common.startInterviewCTA', 'Start your interview')}</h3>
                <Link to="/candidate/register" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">
                  {t('common.startNow', 'Start now')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-[28px] border border-accent/10 bg-white shadow-soft"
            >
              <div className="h-52 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80')" }} />
              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('common.forEmployers', 'For employers')}</p>
                <h3 className="mt-3 text-2xl font-bold text-on-surface">{t('common.viewDashboard', 'Open your dashboard')}</h3>
                <Link to="/login" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">
                  {t('common.viewDashboardLink', 'View dashboard')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </Section>

        <Section id="faq" title={t('common.faqTitle', 'Frequently asked questions')} description={t('common.faqDescription', 'Clear answers before the first interview starts.') }>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={item} className="glass-card overflow-hidden rounded-xl">
                <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span className="font-semibold text-on-surface">{item}</span>
                  <ChevronDown className={`h-5 w-5 text-on-surface-variant transition ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="border-t border-slate-200 px-5 py-4 text-sm text-on-surface-variant">
                    Our interview workflow keeps every candidate experience consistent, fair, and easy to understand while helping recruiting teams review real evidence and make faster decisions.
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      </main>

      <footer className="border-t border-white/50 bg-white/80">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="font-semibold text-on-surface">TalentFlow AI</p>
            <p className="mt-2 text-sm text-on-surface-variant">AI-powered interviews for fairer hiring and stronger teams.</p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-on-surface-variant">
            <Link to="/#about">About</Link>
            <Link to="/#faq">FAQ</Link>
            <Link to="/login">Login</Link>
            <Link to="/karibu">Choose path</Link>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
            <label htmlFor="newsletter-email" className="text-sm font-medium text-on-surface-variant">
              Stay updated
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Email address"
                className="field min-w-0 flex-1"
                aria-label="Email address"
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
            {newsletterStatus.message && (
              <p className={`text-xs ${newsletterStatus.type === 'error' ? 'text-error' : 'text-success'}`}>
                {newsletterStatus.message}
              </p>
            )}
          </form>
        </div>
      </footer>
    </div>
  )
}

function WelcomePage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-radial px-4 py-10">
      <div className="w-full max-w-5xl rounded-[28px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{t('welcome.eyebrow', 'Welcome')}</p>
          <h1 className="mt-3 text-3xl font-extrabold text-on-surface">{t('welcome.title', 'Choose your path')}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/candidate/register" className="group rounded-[24px] border border-primary/20 bg-primary/5 p-6 transition hover:-translate-y-1 hover:shadow-soft">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white"><UserRound className="h-7 w-7" /></div>
            <h2 className="text-2xl font-bold text-on-surface">{t('welcome.candidateTitle', 'Take the interview')}</h2>
            <p className="mt-3 text-on-surface-variant">{t('welcome.candidateDescription', 'Register as a candidate, upload your documents, and complete your AI interview.')}</p>
            <div className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">{t('common.continue', 'Continue')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
          </Link>

          <Link to="/company/register" className="group rounded-[24px] border border-secondary/20 bg-secondary/5 p-6 transition hover:-translate-y-1 hover:shadow-soft">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-white"><Building2 className="h-7 w-7" /></div>
            <h2 className="text-2xl font-bold text-on-surface">{t('welcome.employerTitle', 'Create an interview session')}</h2>
            <p className="mt-3 text-on-surface-variant">{t('welcome.employerDescription', 'Create a new interview session, manage roles, and review candidate performance.')}</p>
            <div className="mt-6 inline-flex items-center gap-2 font-semibold text-secondary">{t('common.continue', 'Continue')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [role, setRole] = useState<'candidate' | 'company'>('candidate')

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-radial px-4 py-10">
      <div className="w-full max-w-md rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('nav.login', 'Login')}</p>
          <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('auth.title', 'Welcome back')}</h1>
        </div>

        <div className="mb-6 flex rounded-xl bg-surface-container p-1">
          <button className={`flex-1 rounded-lg px-4 py-2 font-semibold ${role === 'candidate' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`} onClick={() => setRole('candidate')}>{t('auth.candidate', 'Candidate')}</button>
          <button className={`flex-1 rounded-lg px-4 py-2 font-semibold ${role === 'company' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`} onClick={() => setRole('company')}>{t('auth.company', 'Company')}</button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-on-surface">{t('auth.email', 'Email')}</label>
            <input className="field" type="email" defaultValue="hello@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-on-surface">{t('auth.password', 'Password')}</label>
            <input className="field" type="password" defaultValue="password" />
          </div>
          <button type="button" className="btn btn-primary w-full" onClick={() => navigate(role === 'company' ? '/company/dashboard' : '/candidate/dashboard')}>{t('auth.continue', 'Continue')}</button>
        </form>
      </div>
    </div>
  )
}

function CandidateDashboardPage() {
  const { t } = useTranslation()

  return (
    <PageWrap>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('nav.candidates', 'Candidates')}</p>
          <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('dashboard.welcome', 'Welcome back, Aisha')}</h1>
        </div>
        <Link to="/candidate/interview" className="btn btn-primary">{t('dashboard.startInterview', 'Start interview')}</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {dashboardCards.map(({ title, value, meta, icon: Icon }) => (
          <div key={title} className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
            <p className="text-sm text-on-surface-variant">{t(title, title)}</p>
            <h2 className="mt-3 text-2xl font-bold text-on-surface">{t(value, value)}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">{t(meta, meta)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="mb-5 text-xl font-bold text-on-surface">{t('dashboard.upcoming', 'Upcoming sessions')}</h2>
          <div className="space-y-4">
            {[
              { name: 'dashboard.sessionList.0.name', date: 'dashboard.sessionList.0.date', status: 'dashboard.status.confirmed' },
              { name: 'dashboard.sessionList.1.name', date: 'dashboard.sessionList.1.date', status: 'dashboard.status.pending' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-surface-container-low p-4">
                <div>
                  <p className="font-semibold text-on-surface">{t(item.name, item.name)}</p>
                  <p className="text-sm text-on-surface-variant">{t(item.date, item.date)}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{t(item.status, item.status)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="mb-5 text-xl font-bold text-on-surface">{t('dashboard.documentStatus', 'Document status')}</h2>
          <div className="space-y-3">
            {['dashboard.documentList.0', 'dashboard.documentList.1', 'dashboard.documentList.2'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-slate-200 bg-surface-container-low p-3">
                <span className="text-sm text-on-surface">{t(item, item)}</span>
                <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">{t('dashboard.verified', 'Verified')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrap>
  )
}

function InterviewPage() {
  const { t } = useTranslation()
  const [started, setStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [showCaptions, setShowCaptions] = useState(true)
  const [questionIndex, setQuestionIndex] = useState(1)
  const [seconds, setSeconds] = useState(120)
  const navigate = useNavigate()

  useEffect(() => {
    if (!started) return
    const timer = window.setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 0)), 1000)
    return () => window.clearInterval(timer)
  }, [started])

  const formatTime = (value: number) => `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`

  return (
    <PageWrap>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('interview.title', 'Interview')}</p>
          <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('interview.liveSession', 'Live AI session')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm text-white">
            <span className="h-2.5 w-2.5 animate-pulse-slow rounded-full bg-accent" />
            {t('interview.recording', 'Recording')}
          </div>
          <button className="btn btn-danger" onClick={() => navigate('/candidate/results')}>{t('interview.end', 'End interview')}</button>
        </div>
      </div>

      {!started ? (
        <div className="glass-card rounded-[26px] p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">{t('interview.beforeYouBegin', 'Before you begin')}</h2>
              <ul className="mt-5 space-y-3 text-on-surface-variant">
                <li className="flex items-center gap-3"><BadgeCheck className="h-5 w-5 text-success" /> {t('interview.checkCameraMic', 'Check your camera and microphone.')}</li>
                <li className="flex items-center gap-3"><Mic className="h-5 w-5 text-primary" /> {t('interview.audioTest', 'Test audio before the live session.')}</li>
                <li className="flex items-center gap-3"><CirclePlay className="h-5 w-5 text-secondary" /> {t('interview.quietEnvironment', 'Keep your environment quiet and well-lit.')}</li>
              </ul>
            </div>
            <div className="space-y-3 rounded-2xl bg-surface-container p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('interview.setup', 'Setup')}</p>
              <label className="block text-sm font-medium text-on-surface">{t('interview.camera', 'Camera')}</label>
              <select className="field"><option>{t('interview.integratedCamera', 'Integrated camera')}</option><option>{t('interview.usbWebcam', 'USB webcam')}</option></select>
              <label className="block text-sm font-medium text-on-surface">{t('interview.microphone', 'Microphone')}</label>
              <select className="field"><option>{t('interview.defaultMic', 'Default microphone')}</option><option>{t('interview.usbHeadset', 'USB headset')}</option></select>
              <button type="button" className="btn btn-primary w-full" onClick={() => setStarted(true)}>{t('interview.start', 'Start interview')}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-4 text-white shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300"><span>{t('interview.questionCount', 'Question {{current}} of 8', { current: questionIndex })}</span></div>
              <div className="rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-200">{formatTime(seconds)}</div>
            </div>
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-slate-800 to-slate-950 p-4">
              <div className="relative flex h-[420px] items-end justify-center">
                <div className={`absolute right-4 top-4 flex h-28 w-20 items-center justify-center rounded-2xl border-2 border-white/30 bg-slate-700 ${cameraOn ? '' : 'opacity-30'}`}>
                  <Video className="h-8 w-8 text-slate-200" />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-2xl">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-300">{t('interview.aiInterviewer', 'AI interviewer')}</p>
                    <p className="mt-2 max-w-md text-lg font-medium">{t('interview.questionPrompt', 'Tell me about a time you handled a disagreement with a teammate and what you learned.')}</p>
                  </div>
                </div>
              </div>
              {showCaptions && <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">{t('interview.captionText', 'Live caption: “I focused on the customer experience and kept communication clear.”')}</div>}
            </div>
          </div>

          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-on-surface">{t('interview.controls', 'Controls')}</h2>
                <span className="text-sm text-on-surface-variant">{t('interview.liveStatus', 'Live')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn btn-secondary" onClick={() => setIsMuted((value) => !value)}>{isMuted ? t('interview.unmute', 'Unmute microphone') : t('interview.mute', 'Mute microphone')}</button>
                <button className="btn btn-secondary" onClick={() => setCameraOn((value) => !value)}>{cameraOn ? t('interview.hideCamera', 'Hide camera') : t('interview.showCamera', 'Show camera')}</button>
                <button className="btn btn-secondary" onClick={() => setShowCaptions((value) => !value)}>{showCaptions ? t('interview.hideCaptions', 'Hide captions') : t('interview.showCaptions', 'Show captions')}</button>
                <button className="btn btn-primary" onClick={() => setQuestionIndex((value) => Math.min(value + 1, 8))}>{t('interview.next', 'Next')}</button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="mb-3 text-lg font-bold text-on-surface">{t('interview.notes', 'Session notes')}</h3>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>• {t('interview.consent', 'Consent to recording is active.')}</li>
                <li>• {t('interview.autosave', 'Auto-save is enabled.')}</li>
                <li>• {t('interview.reconnect', 'You can reconnect without losing current progress.')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </PageWrap>
  )
}

function ResultsPage() {
  return (
    <PageWrap>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Results</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">Your interview feedback</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-3xl font-extrabold">92%</span>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-on-surface">Strong fit</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Your communication and clarity were above the benchmark.</p>
        </div>

        <div className="space-y-5">
          {transcript.map((entry) => (
            <div key={entry.speaker} className="glass-card rounded-2xl p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{entry.speaker}</p>
              <p className="text-base text-on-surface">{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrap>
  )
}

function CompanyDashboardPage() {
  const { t } = useTranslation()

  return (
    <PageWrap>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('company.heading', 'Company dashboard')}</p>
          <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('company.overview', 'Hiring overview')}</h1>
        </div>
        <Link to="/company/create-session" className="btn btn-primary">{t('company.createSession', 'Create session')}</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {companyMetrics.map(({ title, value, meta, icon: Icon }) => (
          <div key={title} className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
            <p className="text-sm text-on-surface-variant">{title}</p>
            <h2 className="mt-3 text-2xl font-bold text-on-surface">{value}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">{meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="mb-5 text-xl font-bold text-on-surface">{t('company.review', 'Candidates to review')}</h2>
          <div className="space-y-4">
            {['Aisha Mtega', 'Daniel Kileo', 'Joan Mremi'].map((candidate, index) => (
              <div key={candidate} className="flex items-center justify-between rounded-xl border border-slate-200 bg-surface-container-low p-4">
                <div>
                  <p className="font-semibold text-on-surface">{candidate}</p>
                  <p className="text-sm text-on-surface-variant">Score: {86 + index * 3}%</p>
                </div>
                <button className="btn btn-secondary">{t('common.review', 'Review')}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="mb-5 text-xl font-bold text-on-surface">{t('company.plans', 'Plans')}</h2>
          <div className="space-y-3">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="rounded-xl border border-slate-200 bg-surface-container-low p-3">
                <p className="font-semibold text-on-surface">{plan.name}</p>
                <p className="text-sm text-on-surface-variant">{plan.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrap>
  )
}

function CompanySessionPage() {
  const { t } = useTranslation()

  return (
    <PageWrap>
      <div className="mx-auto max-w-4xl rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('company.sessionTitle', 'Create session')}</p>
          <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('company.sessionHeadline', 'Design a new interview')}</h1>
        </div>

        <form className="grid gap-5 md:grid-cols-2">
          <Field label={t('company.role', 'Role')}><input className="field" defaultValue="Product Designer" /></Field>
          <Field label={t('company.difficulty', 'Difficulty')}><select className="field"><option>Mid-level</option><option>Senior</option><option>Lead</option></select></Field>
          <Field label={t('company.duration', 'Duration (minutes)')} className="md:col-span-2"><input className="field" type="number" defaultValue={45} /></Field>
          <Field label={t('company.topics', 'Topics')} className="md:col-span-2"><input className="field" defaultValue="Communication, prioritization, problem solving" /></Field>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Link to="/company/dashboard" className="btn btn-secondary">{t('company.cancel', 'Cancel')}</Link>
            <button type="button" className="btn btn-primary">{t('company.publish', 'Publish')}</button>
          </div>
        </form>
      </div>
    </PageWrap>
  )
}

function PageWrap({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
}

function Section({ children, title, description, id }: { children: ReactNode; title: string; description: string; id?: string }) {
  return (
    <motion.section id={id} className="mt-20" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{title}</p>
        <h2 className="mt-3 text-3xl font-bold text-on-surface">{description}</h2>
      </div>
      {children}
    </motion.section>
  )
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1 block text-sm font-semibold text-on-surface">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </label>
  )
}

function LanguageToggle() {
  const { i18n } = useTranslation()
  const language = i18n.language === 'en' ? 'en' : 'sw'

  const handleToggle = () => {
    const nextLanguage = language === 'en' ? 'sw' : 'en'
    i18n.changeLanguage(nextLanguage)
    localStorage.setItem('ai-interview-language', nextLanguage)
  }

  return (
    <button type="button" onClick={handleToggle} className="relative flex items-center rounded-full border border-primary/20 bg-surface-container px-1 py-1 text-xs font-semibold text-on-surface shadow-inner">
      <span className={`relative z-10 px-3 py-1.5 ${language === 'en' ? 'text-primary' : 'text-on-surface-variant'}`}>EN</span>
      <span className={`relative z-10 px-3 py-1.5 ${language === 'sw' ? 'text-primary' : 'text-on-surface-variant'}`}>SW</span>
      <span className={`absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-full bg-white shadow transition-transform ${language === 'sw' ? 'translate-x-[100%]' : ''}`} />
    </button>
  )
}

export default App
