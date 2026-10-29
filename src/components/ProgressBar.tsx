interface ProgressBarProps {
  step: number
  onStepClick: (step: number) => void
}

const labels = ['Personen', 'Uiterlijk', 'Namen', 'Controle']

export default function ProgressBar({ step, onStepClick }: ProgressBarProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {labels.map((label, i) => {
        const stepNum = i + 1
        const isPast = stepNum < step
        const isCurrent = stepNum === step
        return (
          <button
            key={label}
            onClick={() => onStepClick(stepNum)}
            style={{
              flex: 1,
              border: 0,
              background: 'none',
              padding: '4px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                height: '4px',
                width: '100%',
                borderRadius: '2px',
                background: isPast ? 'var(--color-trust)' : isCurrent ? 'var(--color-accent)' : 'var(--color-field-border)',
                transition: 'background .2s',
              }}
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: isPast ? 'var(--color-trust)' : isCurrent ? 'var(--color-ink)' : 'var(--color-faint)',
                transition: 'color .2s',
              }}
            >
              {stepNum} {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
