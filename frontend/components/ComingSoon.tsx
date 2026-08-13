export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/50 p-5">
      <div className="flex items-center gap-2">
        <h3 className="font-medium">{title}</h3>
        <span className="rounded-full bg-line px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
          Coming soon
        </span>
      </div>
      <p className="mt-1.5 text-sm text-muted">{description}</p>
    </div>
  );
}
