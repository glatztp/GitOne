import type { JSX } from "react";
import { GitCommit } from "@phosphor-icons/react";
import type { GitHubRepo } from "./types";
import { timeAgo } from "./utils";
import { motion } from "framer-motion";

type Props = { repos: GitHubRepo[]; loading: boolean; error: string | null };

export default function ActivityCard({
  repos,
  loading,
  error,
}: Props): JSX.Element {
  return (
    <motion.div
      className="card rounded-xl border p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="text-lg font-bold text-color">Atividade Recente</h3>
      <div className="mt-4">
        {loading && (
          <div className="text-color/70">Carregando atividade...</div>
        )}
        {error && <div className="text-sm text-red-400">{error}</div>}
        {!loading && !error && repos.length === 0 && (
          <div className="text-color/70">Nenhum repositório encontrado.</div>
        )}

        {!loading && repos.length > 0 && (
          <ul className="-mb-8" role="list" aria-label="Atividade recente">
            {repos.slice(0, 6).map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <div className="relative pb-8">
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border-dark"
                  />
                  <div className="relative flex items-center space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-surface-dark">
                        <GitCommit size={16} />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-color">
                          <span>Atualização em </span>
                          <a
                            className="font-medium text-primary hover:underline"
                            href={r.html_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {r.name}
                          </a>
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-color/70">
                        <time dateTime={r.pushed_at}>
                          {timeAgo(r.pushed_at)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
