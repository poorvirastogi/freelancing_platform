import { cn } from "../../lib/cn";

export function Spinner({ size = 20, className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block rounded-full border-2 border-line border-t-accent animate-spin-slow", className)}
      style={{ width: size, height: size, animationDuration: "0.7s" }}
    />
  );
}

/** Full-panel centered loading state. */
export function LoadingState({ label = "Loading", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-20 text-muted", className)}>
      <Spinner size={28} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default Spinner;
