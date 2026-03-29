import Image from 'next/image'

export default function NavLogo({ name, logoUrl }: { name?: string; logoUrl?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="logo" width={30} height={30} style={{ objectFit: 'contain', borderRadius: 4 }} />
      ) : (
        <Image src="/logo.svg" alt="logo" width={30} height={30} priority />
      )}
      <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1 }}>
        {name ? (
          <span style={{ color: 'var(--text)' }}>{name}</span>
        ) : (
          <>

            <span style={{ color: 'var(--text)' }}> cargohub</span>
          </>
        )}
      </span>
    </span>
  )
}
