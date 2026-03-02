import { UserAuth } from "@/context/AuthContext"

export default function Home() {
    const { profile } = UserAuth();
  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Welcome back, {profile && (profile?.name.split(" "))[0]}!
      </h2>
      <p className="mt-1 text-muted-foreground">
        Here is an overview of your store.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Total Products
          </p>
          <p className="mt-1 text-2xl font-semibold text-card-foreground">
            128
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Open Orders
          </p>
          <p className="mt-1 text-2xl font-semibold text-card-foreground">24</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-card-foreground">
            $12,450
          </p>
        </div>
      </div>
    </div>
  );
}
