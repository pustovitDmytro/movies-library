import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

export function Header() {
  const loc = useLocation();
  const home = loc.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-netflix-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link
          to="/"
          className="font-display text-2xl tracking-[0.08em] text-netflix-red sm:text-3xl"
        >
          FILMS
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-300">
          <Link
            to="/"
            className={clsx(
              "transition hover:text-white",
              home && "text-white",
            )}
          >
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}
