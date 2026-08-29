export default function WizardProgress({ labels, currentIndex }: { labels: string[]; currentIndex: number }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {labels.map((label, index) => (
        <div key={label} className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              index === currentIndex
                ? 'bg-primary text-white'
                : index < currentIndex
                ? 'bg-secondary/20 text-secondary'
                : 'bg-slate-200 text-on-surface-variant'
            }`}
          >
            {index + 1}
          </div>
          <span className="hidden text-sm text-on-surface-variant sm:inline">{label}</span>
        </div>
      ))}
    </div>
  )
}
