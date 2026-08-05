import { cn } from "../../lib/cn";

/**
 * Consistent page title block with optional eyebrow + actions slot.
 */
export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent mb-2">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-muted max-w-2xl text-pretty">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3 shrink-0">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
