import { cn } from "../../lib/cn";

const controlBase =
  "w-full bg-bg-elev text-foreground placeholder:text-faint border border-line " +
  "rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm transition-colors duration-200 " +
  "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn(
        "block text-xs font-medium uppercase tracking-wider text-muted mb-1.5",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(controlBase, "resize-y min-h-24", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(controlBase, "appearance-none cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

/** Label + control + optional hint/error wrapper. */
export function Field({ label, hint, error, htmlFor, className, children }) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export default Field;
