export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-screen-2xl space-y-5">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
