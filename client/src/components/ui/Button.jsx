import { cn } from "../../lib/cn";

/**
 * Presentational button. Purely visual — pass through any handlers/props.
 * variants: primary | secondary | ghost | outline | danger | success
 * sizes: sm | md | lg
 */
const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] " +
  "transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed " +
  "disabled:pointer-events-none select-none whitespace-nowrap";

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
  icon: "p-2",
};

const variants = {
  primary:
    "bg-accent text-accent-fg hover:brightness-110 active:brightness-95 " +
    "shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_24px_-12px_var(--accent)]",
  secondary:
    "bg-surface-2 text-foreground border border-line hover:border-line-strong hover:bg-[var(--surface)]",
  outline:
    "bg-transparent text-foreground border border-line-strong hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface-2",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
  success: "bg-success text-[#04120c] hover:brightness-110 active:brightness-95",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(base, sizes[size] || sizes.md, variants[variant] || variants.primary, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
