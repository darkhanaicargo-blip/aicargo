import Image from 'next/image'

export default function NavLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
      <Image src="/logo.svg" alt="Ai cargo logo" width={30} height={30} priority />
      <span style={{
        fontSize: '1.05rem', fontWeight: 800,
        letterSpacing: '-0.3px', lineHeight: 1,
      }}>
        <span style={{ color: 'var(--accent)' }}>Ai</span>
        <span style={{ color: 'var(--text)' }}> cargo</span>
      </span>
    </span>
  )
}
