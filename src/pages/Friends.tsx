import { useEffect, useState } from "react";
import { getMovies, type Movie } from "@/api/movies";
import { RowSection } from "@/components/RowSection";

const mockFriends = [
  { id: "1", name: "Marta", status: "Watched 12 titles this week" },
  { id: "2", name: "Dmytro", status: "Added 3 new thrillers" },
  { id: "3", name: "Ira", status: "Recommends emotional dramas" },
];

export function Friends() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovies();

        if (isMounted) {
          setMovies(data.items);
        }
      } catch {
        if (isMounted) {
          setError("Не вдалося завантажити фільми");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="min-h-full bg-[#0b2545] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8da9c4]">Friends</p>
          <h1 className="text-4xl font-bold text-[#eef4ed]">See what your circle is watching</h1>
          <p className="text-sm text-[#8da9c4]">Social discovery stays lightweight here: mock friend activity paired with recommendations from the current movie feed.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {mockFriends.map((friend) => (
            <article key={friend.id} className="rounded-2xl bg-[#13315c] p-5 transition duration-300 hover:scale-[1.02]">
              <p className="text-lg font-semibold text-[#eef4ed]">{friend.name}</p>
              <p className="mt-2 text-sm text-[#8da9c4]">{friend.status}</p>
            </article>
          ))}
        </div>

        {loading && <p className="text-base text-[#eef4ed]">Завантаження...</p>}
        {error && <p className="text-base text-[#eef4ed]">{error}</p>}

        {!loading && !error && <RowSection title="Recommendations From Friends" movies={movies.slice(0, 10)} />}
      </div>
    </section>
  );
}
