import { cn } from "../../lib/cn";

/**
 * Consistent empty/zero-state block.
 */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        "bg-surface border border-dashed border-line rounded-[var(--radius-lg)]",
        className
      )}
    >
      {Icon ? (
        <span className="grid place-items-center h-12 w-12 rounded-full bg-accent-soft text-accent mb-4">
          <Icon size={22} strokeWidth={1.75} />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 text-sm text-muted max-w-sm text-pretty">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
