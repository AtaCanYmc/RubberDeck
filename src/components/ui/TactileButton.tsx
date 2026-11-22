import type { ButtonHTMLAttributes } from 'react';

export type TactileVariant = 'default' | 'signal' | 'ghost' | 'danger' | 'keycap';

interface TactileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TactileVariant;
}

const VARIANT_CLASSES: Record<TactileVariant, string> = {
  default:
    'hw-keycap rounded-lg px-3.5 py-2 text-xs font-medium text-zinc-100 disabled:opacity-40',
  signal:
    'hw-keycap-signal rounded-lg px-4 py-2 text-xs font-semibold tracking-tight disabled:opacity-40',
  ghost:
    'rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-white/[0.16] hover:bg-zinc-800/80 hover:text-zinc-100 active:scale-[0.97] disabled:opacity-40',
  danger:
    'rounded-lg border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:border-amber-400/50 hover:bg-amber-950/50 active:scale-[0.97] disabled:opacity-40',
  keycap: 'hw-keycap rounded-xl text-zinc-100 disabled:opacity-40',
};

export function TactileButton({
  variant = 'default',
  className = '',
  type = 'button',
  ...props
}: TactileButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex select-none items-center justify-center gap-2 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
