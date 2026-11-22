export type LedTone = 'green' | 'amber' | 'red' | 'signal' | 'off';

interface StatusLedProps {
  tone: LedTone;
  pulse?: boolean;
  size?: 'sm' | 'md';
  label?: string;
}

const TONE_CLASSES: Record<LedTone, string> = {
  green: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]',
  amber: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
  red: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]',
  signal: 'bg-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.8)]',
  off: 'bg-zinc-600 shadow-none',
};

export function StatusLed({ tone, pulse = false, size = 'sm', label }: StatusLedProps) {
  const dim = size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5';
  return (
    <span
      className="relative inline-flex items-center justify-center"
      aria-label={label}
      role={label ? 'status' : undefined}
    >
      {pulse && tone !== 'off' && (
        <span
          aria-hidden="true"
          className={`absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping ${TONE_CLASSES[tone].split(' ')[0]}`}
        />
      )}
      <span
        aria-hidden="true"
        className={`relative inline-block rounded-full ${dim} ${TONE_CLASSES[tone]}`}
      />
    </span>
  );
}
