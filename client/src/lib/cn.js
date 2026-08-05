// Tiny className joiner — filters out falsy values.
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
