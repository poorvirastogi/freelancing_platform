import { cn } from "../../lib/cn";

/**
 * Sharp, restrained "module" card built on semantic tokens.
 * Adapts automatically to the active portal theme.
 */
export function Card({ className, interactive = false, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-[var(--radius-lg)]",
        interactive &&
          "transition-all duration-200 hover:border-line-strong hover:bg-[var(--bg-elev)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4 px-6 pt-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm text-muted mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("flex items-center gap-3 px-6 py-4 border-t border-line", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
