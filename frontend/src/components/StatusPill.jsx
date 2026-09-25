export default function StatusPill({ status }) {
  const normalizedStatus = status ? String(status).toLowerCase() : 'clear'
  const styles = {
    high: 'border-[var(--color-bolosafe-pink)]/30 bg-[var(--color-bolosafe-pink)]/10 text-[var(--color-bolosafe-pink)]',
    medium: 'border-[var(--color-bolosafe-yellow)]/30 bg-[var(--color-bolosafe-yellow)]/10 text-[var(--color-bolosafe-yellow)]',
    low: 'border-[var(--color-bolosafe-cyan)]/30 bg-[var(--color-bolosafe-cyan)]/10 text-[var(--color-bolosafe-cyan)]',
    clear: 'border-[var(--color-bolosafe-border)] bg-[var(--color-bolosafe-dark)] text-slate-300',
    verified: 'border-[var(--color-bolosafe-cyan)]/30 bg-[var(--color-bolosafe-cyan)]/10 text-[var(--color-bolosafe-cyan)]',
    mismatch: 'border-[var(--color-bolosafe-pink)]/30 bg-[var(--color-bolosafe-pink)]/10 text-[var(--color-bolosafe-pink)]',
    normal: 'border-[var(--color-bolosafe-cyan)]/30 bg-[var(--color-bolosafe-cyan)]/10 text-[var(--color-bolosafe-cyan)]',
    monitoring: 'border-[var(--color-bolosafe-yellow)]/30 bg-[var(--color-bolosafe-yellow)]/10 text-[var(--color-bolosafe-yellow)]',
    anomalous: 'border-[var(--color-bolosafe-pink)]/30 bg-[var(--color-bolosafe-pink)]/10 text-[var(--color-bolosafe-pink)]'
  }

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${styles[normalizedStatus] || styles.clear}`}>
      {status || 'CLEAR'}
    </span>
  )
}