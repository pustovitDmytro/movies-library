import { Link, useParams } from "react-router-dom";
import { getMovieByTmdbId } from "@/lib/movies";
import { getYoutubeVideoId } from "@/lib/youtube";

export function MovieDetail() {
  const { tmdbId } = useParams();
  const id = Number(tmdbId);
  const movie = Number.isFinite(id) ? getMovieByTmdbId(id) : undefined;

  if (!movie) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-white">Not found</h1>
        <p className="mt-4 text-zinc-400">
          This title is not in your library.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded bg-netflix-red px-6 py-3 text-sm font-semibold text-white hover:bg-netflix-redHover"
        >
          Back to browse
        </Link>
      </div>
    );
  }

  const d = movie.details;
  const hero = d.posters[0];
  const poster = d.posters[1] ?? d.posters[0];

  return (
    <article>
      <section className="relative -mt-px min-h-[42vh] overflow-hidden sm:min-h-[48vh]">
        {hero && (
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_15%]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-black/50" />
        <div className="relative mx-auto flex max-w-[1920px] flex-col gap-8 px-4 pb-12 pt-8 sm:flex-row sm:items-end sm:px-8">
          <div className="relative -mb-20 hidden w-48 shrink-0 overflow-hidden rounded-lg shadow-2xl ring-2 ring-white/10 sm:block sm:w-56 md:w-64">
            {poster ? (
              <img
                src={poster}
                alt=""
                className="aspect-[2/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center bg-zinc-800 text-zinc-500">
                No poster
              </div>
            )}
          </div>
          <div className="sm:pb-4 sm:pl-4">
            <Link
              to="/"
              className="mb-4 inline-flex text-sm text-netflix-red hover:underline"
            >
              ← Back to library
            </Link>
            <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">
              {d.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
              <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5">
                {d.year}
              </span>
              <span>{d.durationMinutes} min</span>
              <span className="text-amber-400">★ {d.rating.toFixed(1)}</span>
              <span className="text-zinc-500">·</span>
              <span>{d.director}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-zinc-200"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1920px] px-4 pb-16 pt-24 sm:px-8 sm:pt-12">
        <div className="mb-10 sm:hidden">
          <div className="mx-auto max-w-[200px] overflow-hidden rounded-lg shadow-xl ring-1 ring-white/10">
            {poster ? (
              <img
                src={poster}
                alt=""
                className="aspect-[2/3] w-full object-cover"
              />
            ) : null}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 font-display text-2xl tracking-wide text-white">
                Synopsis
              </h2>
              <p className="max-w-3xl leading-relaxed text-zinc-300">
                {d.description}
              </p>
            </section>
            <section>
              <h2 className="mb-3 font-display text-2xl tracking-wide text-white">
                Cast
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {d.actors.slice(0, 18).map((a) => (
                  <li
                    key={`${a.name}-${a.character}`}
                    className="rounded-lg border border-white/5 bg-zinc-900/60 px-3 py-2"
                  >
                    <p className="font-medium text-white">{a.name}</p>
                    <p className="text-sm text-zinc-500">{a.character}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <aside className="space-y-4 rounded-xl border border-white/10 bg-zinc-900/40 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">File</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-zinc-300">
                  {movie.originalFileName}
                </dd>
              </div>
              {movie.folder && (
                <div>
                  <dt className="text-zinc-500">Folder</dt>
                  <dd className="mt-0.5 text-zinc-300">{movie.folder}</dd>
                </div>
              )}
              <div>
                <dt className="text-zinc-500">Language</dt>
                <dd className="mt-0.5 text-zinc-300">{d.language}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Countries</dt>
                <dd className="mt-0.5 text-zinc-300">{d.country.join(", ")}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl tracking-wide text-white">
            Trailers
          </h2>
          {d.trailers.length === 0 ? (
            <p className="text-zinc-500">No trailers in the local data.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {d.trailers.map((url, i) => {
                const vid = getYoutubeVideoId(url);
                if (!vid) {
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/10 bg-zinc-900/60 p-6 text-netflix-red hover:underline"
                    >
                      Open trailer {i + 1}
                    </a>
                  );
                }
                return (
                  <div
                    key={url}
                    className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-xl"
                  >
                    <div className="aspect-video w-full">
                      <iframe
                        title={`Trailer ${i + 1}`}
                        src={`https://www.youtube.com/embed/${vid}`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {d.posters.length > 1 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-2xl tracking-wide text-white">
              Posters & stills
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {d.posters.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-56 w-auto shrink-0 rounded-md object-cover ring-1 ring-white/10"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
