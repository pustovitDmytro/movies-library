import { useMemo, useState } from "react";
import { Filters, type FilterState } from "@/components/Filters";
import { Hero } from "@/components/Hero";
import { MovieCard } from "@/components/MovieCard";
import {
  filterMovies,
  getAllMovies,
  getFeaturedMovie,
  getFilterOptions,
} from "@/lib/movies";

export function Home() {
  const all = getAllMovies();
  const opts = useMemo(() => getFilterOptions(), []);
  const featured = useMemo(() => getFeaturedMovie(), []);

  const [filters, setFilters] = useState<FilterState>(() => ({
    years: [],
    genres: [],
    actors: [],
    minRating: opts.minRating,
    maxRating: opts.maxRating,
  }));

  const filtered = useMemo(
    () => filterMovies(all, filters),
    [all, filters],
  );

  return (
    <>
      {featured && <Hero movie={featured} />}
      <Filters options={opts} value={filters} onChange={setFilters} />
      <section className="mx-auto max-w-[1920px] px-4 py-10 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Your library
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {filtered.length} title{filtered.length === 1 ? "" : "s"} match
              your filters
            </p>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/15 bg-zinc-900/50 px-6 py-16 text-center text-zinc-400">
            No films match these filters. Try relaxing year, genre, actor, or
            rating selections.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {filtered.map((m) => (
              <MovieCard key={`${m.tmdbId}-${m.originalFileName}`} movie={m} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
