export function StatusCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-surface-2 border-b border-border">
        <h2 className="font-serif text-base text-text-1 font-semibold">
          {title}
        </h2>
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
