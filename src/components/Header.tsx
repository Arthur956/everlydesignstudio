interface HeaderProps {
  returnTo?: string
}

export default function Header({ returnTo }: HeaderProps) {
  return (
    <header
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '12px 40px',
        borderBottom: '1px solid var(--color-line)',
      }}
    >
      <a
        href={returnTo || '/'}
        style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', textDecoration: 'none' }}
      >
        ← Terug naar de shop
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--color-brand)' }}>
          Everly
        </span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            borderLeft: '1px solid var(--color-field-border)',
            paddingLeft: '12px',
          }}
        >
          Ontwerpstudio
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '14px', color: 'var(--color-body)' }}>
        <span style={{ whiteSpace: 'nowrap' }}>
          Hulp nodig?{' '}
          <a href="#" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
            Klantenservice
          </a>
        </span>
      </div>
    </header>
  )
}
