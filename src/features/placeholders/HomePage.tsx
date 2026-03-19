import { useQuery } from "@tanstack/react-query";
import { ping } from "@/api/health";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";

export function HomePage() {
  const pingQuery = useQuery({
    queryKey: ["ping"],
    queryFn: ping,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Home (TODO)</h1>
      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-sm font-medium">Health Check</h2>
        {pingQuery.isLoading && <Loading text="Calling /ping..." />}
        {pingQuery.isError && <ErrorState message="Failed to call /ping" />}
        {pingQuery.data && (
          <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
            {JSON.stringify(pingQuery.data, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}
