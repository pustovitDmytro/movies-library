import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-netflix-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1920px] items-center px-4 py-3 sm:px-8">
        <Link
          to="/"
          className="font-display text-2xl tracking-[0.08em] text-netflix-red sm:text-3xl"
        >
          FILMS
        </Link>
      </div>
    </header>
  );
}
