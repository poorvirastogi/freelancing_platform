import { cn } from "../../lib/cn";

/**
 * Ledger-style metric tile. `value` is rendered in mono for on-chain feel.
 */
export function StatCard({ label, value, hint, icon: Icon, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-[var(--radius-lg)] p-5",
        "transition-colors duration-200 hover:border-line-strong",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-faint font-medium">
          {label}
        </span>
        {Icon ? (
          <span className="grid place-items-center h-8 w-8 rounded-[var(--radius-sm)] bg-accent-soft text-accent">
            <Icon size={16} strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <div className="mt-3 font-data text-2xl font-semibold text-foreground tabular-nums">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export default StatCard;
