export default function Logomark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="apex-gold" x1="0" y1="48" x2="24" y2="0">
          <stop offset="0" stopColor="#cda44f" />
          <stop offset="1" stopColor="#e8c579" />
        </linearGradient>
        <linearGradient id="apex-violet" x1="24" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#a996ff" />
          <stop offset="1" stopColor="#8f7cf0" />
        </linearGradient>
      </defs>
      <path d="M20 4L4 42H16L20 32L24 42H30L20 4Z" fill="url(#apex-gold)" />
      <path d="M28 16L18 42H30L34 32L38 42H44L28 16Z" fill="url(#apex-violet)" />
    </svg>
  );
}
