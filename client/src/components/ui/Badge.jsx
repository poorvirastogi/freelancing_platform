import { cn } from "../../lib/cn";

/**
 * Compact status/label chip. tones map to functional colors.
 * tones: neutral | accent | success | warning | danger
 */
const tones = {
  neutral: "bg-surface-2 text-muted border border-line",
  accent: "bg-accent-soft text-accent border border-[color:var(--accent)]/30",
  success: "bg-success-soft text-success border border-[color:var(--success)]/30",
  warning: "bg-warning-soft text-warning border border-[color:var(--warning)]/30",
  danger: "bg-danger-soft text-danger border border-[color:var(--danger)]/30",
};

export function Badge({ tone = "neutral", mono = false, className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium leading-none",
        mono && "font-data",
        tones[tone] || tones.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
