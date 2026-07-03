/** Join truthy class names. Tiny helper to keep JSX readable. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
