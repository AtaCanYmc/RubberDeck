import type { ReactNode } from 'react';

interface SectionLabelProps {
  kicker: string;
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function SectionLabel({ kicker, title, subtitle, rightSlot }: SectionLabelProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.07] pb-3">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          {kicker}
        </p>
        <h2 className="mt-0.5 text-base font-semibold tracking-tight text-zinc-100">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{subtitle}</p>
        )}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}
