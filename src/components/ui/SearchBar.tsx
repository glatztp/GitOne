import type { JSX } from "react";
import { MagnifyingGlassIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  onSearch: (q: string) => void;
};

export default function SearchBar({
  query,
  setQuery,
  onSearch,
}: Props): JSX.Element {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-color/50">
          <MagnifyingGlassIcon size={16} className="text-color/50" />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) onSearch(query.trim());
          }}
          className="rounded-md border bg-surface-dark/50 py-2 pl-10 pr-10 text-sm text-color placeholder-color/50 focus:border-primary focus:ring-primary"
          placeholder="Buscar usuário do GitHub e pressionar Enter..."
          aria-label="Buscar usuário"
        />
        {query && (
          <button
            aria-label="Limpar busca"
            onClick={() => {
              setQuery("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-color/70 hover:text-color"
          >
            ×
          </button>
        )}
      </div>
      <button
        onClick={() => {
          if (!query.trim()) return;
          onSearch(query.trim());
        }}
        className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold  border"
      >
        <ArrowRightIcon size={16} />
        Buscar
      </button>
    </motion.div>
  );
}
