/* Labeled filename input, matching the SelectControl row style. */
export function NameField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="shrink-0 text-sm text-linen/70">Name</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 flex-1 rounded-xl border border-white/[0.07] bg-black/30 px-3.5 text-sm text-linen transition-colors placeholder:text-linen/30 hover:border-white/[0.14] focus:border-flame/50 focus:outline-none"
      />
    </label>
  );
}
