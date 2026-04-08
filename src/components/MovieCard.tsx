import { Link } from "react-router-dom";
import clsx from "clsx";
import type { MovieRecord } from "@/types/movie";

type Props = {
  movie: MovieRecord;
  className?: string;
};

export function MovieCard({ movie, className }: Props) {
  const d = movie.details;
  const poster = d.posters[0];

  return (
    <Link
      to={`/movie/${movie.tmdbId}`}
      className={clsx(
        "group relative block aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 shadow-lg ring-1 ring-white/10 transition duration-300 hover:z-10 hover:scale-[1.04] hover:shadow-2xl hover:ring-netflix-red/50",
        className,
      )}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:brightness-75"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
          No poster
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="line-clamp-2 font-semibold leading-tight text-white drop-shadow-md">
          {d.title}
        </p>
        <p className="mt-1 text-xs text-zinc-300">
          {d.year} · ★ {d.rating.toFixed(1)}
        </p>
      </div>
      <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-sm">
        {d.rating.toFixed(1)}
      </span>
    </Link>
  );
}
