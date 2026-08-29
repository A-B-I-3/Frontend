import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import WizardProgress from '../../components/WizardProgress'
import { useAuth } from '../../context/AuthContext'

export function CandidateWizardDocuments() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    setFiles((prev) => [...prev, ...Array.from(fileList)])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!files.length) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('documents', f))
      await client.post('/interviewee/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/candidate/interviews')
    } catch {
      setError(t('common.error', 'Something went wrong. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    navigate('/candidate/register/profile', { replace: true })
    return null
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('auth.candidate', 'Candidate')}</p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">{t('wizard.documents.title', 'Upload your documents')}</h1>
      </div>

      <WizardProgress
        labels={[t('wizard.steps.profile', 'Profile'), t('wizard.steps.education', 'Education & Skills'), t('wizard.steps.documents', 'Documents')]}
        currentIndex={2}
      />

      <div className="rounded-[26px] border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-md">
        <p className="mb-4 text-sm text-on-surface-variant">
          {t('wizard.documents.instructions', 'Upload your certificates and credentials (PDF, JPG, or PNG)')}
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            addFiles(e.dataTransfer.files)
          }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-outline-variant p-8 text-center text-on-surface-variant hover:border-primary"
        >
          {t('wizard.documents.dragDrop', 'Drag and drop files here, or click to browse')}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-outline-variant px-3 py-2 text-sm">
                <span className="truncate">{f.name}</span>
                <button type="button" onClick={() => removeFile(i)} className="text-accent">
                  {t('wizard.documents.remove', 'Remove')}
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={uploading || !files.length}
          className="btn btn-primary mt-6 w-full disabled:opacity-50"
        >
          {uploading ? t('wizard.documents.uploading', 'Uploading...') : t('forms.continue', 'Continue')}
        </button>
      </div>
    </div>
  )
}
