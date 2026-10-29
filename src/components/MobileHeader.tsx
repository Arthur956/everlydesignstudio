interface MobileHeaderProps {
  returnTo?: string
  saved: boolean
}

export default function MobileHeader({ returnTo, saved }: MobileHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px 8px 8px',
        borderBottom: '1px solid var(--color-line)',
      }}
    >
      <a
        href={returnTo || '/'}
        style={{ height: '44px', padding: '0 10px', display: 'flex', alignItems: 'center', fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', textDecoration: 'none' }}
      >
        ← Terug
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-brand)' }}>
          Everly
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            borderLeft: '1px solid var(--color-field-border)',
            paddingLeft: '8px',
          }}
        >
          Ontwerpstudio
        </span>
      </div>
      <span
        style={{
          whiteSpace: 'nowrap',
          padding: '0 4px',
          fontSize: '13px',
          color: saved ? 'var(--color-trust)' : 'var(--color-faint)',
          fontWeight: 600,
        }}
      >
        ● {saved ? 'Bewaard' : 'Bewaren…'}
      </span>
    </header>
  )
}
