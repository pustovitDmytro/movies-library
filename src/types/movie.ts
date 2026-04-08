export type Actor = {
  name: string;
  character: string;
};

export type MovieDetails = {
  title: string;
  durationMinutes: number;
  genres: string[];
  actors: Actor[];
  year: number;
  rating: number;
  posters: string[];
  trailers: string[];
  director: string;
  description: string;
  country: string[];
  language: string;
};

export type MovieRecord = {
  originalFileName: string;
  folder: string | null;
  tmdbId: number;
  tmdbTitle: string;
  details: MovieDetails;
};
