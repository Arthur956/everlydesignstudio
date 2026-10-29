interface SuccessScreenProps {
  designId: string
  returnTo?: string
}

export default function SuccessScreen({ designId, returnTo }: SuccessScreenProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          background: '#fff',
          borderRadius: '24px',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 20px 50px -20px rgba(42,28,20,.2)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'var(--color-trust)',
            fontWeight: 700,
          }}
        >
          ✓
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          Ontwerp bewaard!
        </h1>

        <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.5, color: 'var(--color-body)' }}>
          Je ontwerp is opgeslagen met nummer:
        </p>

        <div
          style={{
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-ink)',
            background: 'var(--color-sand)',
            borderRadius: '12px',
            padding: '12px 20px',
            wordBreak: 'break-all',
          }}
        >
          {designId}
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'var(--color-sage)',
            fontSize: '14px',
            lineHeight: 1.45,
            color: 'var(--color-trust)',
            textAlign: 'left',
            width: '100%',
          }}
        >
          <strong>Volgende stap:</strong> We koppelen je ontwerp straks automatisch aan je winkelmandje in de shop. Voorlopig is je ontwerp veilig bewaard.
        </div>

        {returnTo && (
          <a
            href={returnTo}
            style={{
              height: '52px',
              padding: '0 28px',
              borderRadius: '99px',
              background: 'var(--color-accent)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              width: '100%',
            }}
          >
            Terug naar de shop →
          </a>
        )}
      </div>
    </div>
  )
}
