import type { JSX } from "react";
import type { GitHubRepo } from "./types";
import { MagnifyingGlassIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import Pagination from "../ui/Pagination";
import { timeAgo } from "./utils";
import { motion } from "framer-motion";

type Props = {
  username: string;
  repos: GitHubRepo[];
  paginatedRepos: GitHubRepo[];
  sortMode: "pushed" | "stars";
  onSortToggle: () => void;
  onFilterReset: () => void;
  onFilter: (v: string) => void;
  safePage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function RepoList({
  repos,
  paginatedRepos,
  sortMode,
  onSortToggle,
  onFilterReset,
  onFilter,
  safePage,
  totalPages,
  onPrev,
  onNext,
}: Props): JSX.Element {
  return (
    <div className="card rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-dark p-4 md:p-6">
        <h3 className="text-lg font-bold text-color">Repositórios</h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-color/50">
              <MagnifyingGlassIcon size={16} className="text-color/50" />
            </span>
            <input
              className="w-full rounded-md border-border-dark bg-surface-dark/50 py-2 pl-10 pr-4 text-sm text-color placeholder-color/50 focus:border-primary focus:ring-primary sm:w-auto"
              placeholder="Filtrar repositórios por nome..."
              type="text"
              aria-label="Filtrar repositórios"
              onChange={(e) => {
                const v = e.target.value.toLowerCase();
                if (!v) {
                  onFilterReset();
                  return;
                }
                onFilter(v);
              }}
            />
          </div>

          <button
            onClick={onSortToggle}
            className="flex items-center gap-2 rounded-md border border-border-dark bg-surface-dark/50 px-3 py-2 text-sm text-color/90 hover:border-primary/50"
            title={
              sortMode === "pushed"
                ? "Ordenar por Stars"
                : "Ordenar por Recentes"
            }
          >
            <FunnelSimpleIcon size={16} className="text-color/90" />
            <span>
              {sortMode === "pushed" ? "Ordenar: Recentes" : "Ordenar: Stars"}
            </span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex border-b border-border-dark text-sm font-medium text-color/70">
          <button className="border-b-2 border-primary px-4 py-3 text-primary">
            Populares ({repos.length})
          </button>
          <button className="border-b-2 border-transparent px-4 py-3 hover:border-primary/50 hover:text-color">
            Privados
          </button>
          <button className="border-b-2 border-transparent px-4 py-3 hover:border-primary/50 hover:text-color">
            Arquivados
          </button>
        </div>

        <div className="divide-y divide-border-dark">
          {paginatedRepos.map((repo, i) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.18 }}
              className="flex flex-col gap-2 p-4 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-color hover:underline"
                  >
                    {repo.name}
                  </a>
                  {repo.description && (
                    <p className="mt-1 text-sm text-color/70">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-color/70">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">
                      star
                    </span>
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">
                      call_split
                    </span>
                    <span>{repo.forks_count}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-color/70">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      repo.language === "JavaScript"
                        ? "bg-primary"
                        : repo.language === "TypeScript"
                        ? "bg-[#3178c6]"
                        : "bg-[#3572A5]"
                    }`}
                  />{" "}
                  <span>{repo.language ?? "—"}</span>
                </div>
                <div className="text-xs">{timeAgo(repo.pushed_at)}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <Pagination
          safePage={safePage}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
    </div>
  );
}
