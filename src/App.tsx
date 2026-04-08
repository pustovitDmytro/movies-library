import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { MovieDetail } from "@/pages/MovieDetail";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:tmdbId" element={<MovieDetail />} />
      </Routes>
    </Layout>
  );
}
