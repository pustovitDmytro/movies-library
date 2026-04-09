import { Link } from "react-router-dom";
import type { MovieRecord } from "@/types/movie";

type Props = {
  movie: MovieRecord;
};

export function Hero({ movie }: Props) {
  const d = movie.details;
  const bg = d.posters[0];

  return (
    <section className="relative -mt-px min-h-[56vh] overflow-hidden sm:min-h-[62vh]">
      {bg && (
        <img
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-black/40" />
      <div className="relative mx-auto flex max-w-[1920px] min-h-[56vh] flex-col justify-end px-4 pb-16 pt-24 sm:min-h-[62vh] sm:px-8 sm:pb-20">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-netflix-red">
          Featured
        </p>
        <h1 className="max-w-3xl font-display text-5xl tracking-wide text-white drop-shadow-lg sm:text-6xl md:text-7xl">
          {d.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-200">
          <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 font-medium">
            {d.year}
          </span>
          <span>{d.durationMinutes} min</span>
          <span className="text-amber-400">★ {d.rating.toFixed(1)}</span>
          <span className="hidden text-zinc-400 sm:inline">
            {d.genres.join(" · ")}
          </span>
        </div>
        <p className="mt-4 max-w-2xl line-clamp-3 text-base leading-relaxed text-zinc-200 sm:line-clamp-4">
          {d.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={`/movie/${movie.tmdbId}`}
            className="inline-flex items-center justify-center rounded bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            More info
          </Link>
        </div>
      </div>
    </section>
  );
}
