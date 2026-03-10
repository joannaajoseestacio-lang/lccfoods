import { UserAuth } from "@/context/AuthContext";

export default function Home() {
  const { profile } = UserAuth();
  
  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Good {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your system.
          </p>
        </div>
    
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={5335} loading={false} />
        <StatCard label="Teachers" value={4432} loading={false} />
        <StatCard label="Stores" value={5444} loading={false} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  isRaw,
}: {
  label: string;
  value: number | string;
  loading: boolean;
  isRaw?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-7 w-16 rounded bg-muted animate-pulse" />
        ) : (
          <p className="mt-0.5 text-2xl font-semibold text-card-foreground">
            {isRaw ? value : Number(value).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
