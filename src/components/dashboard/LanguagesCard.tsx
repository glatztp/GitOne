import type { JSX } from "react";
import type { GitHubRepo } from "./types";
import { motion } from "framer-motion";

type Props = { repos: GitHubRepo[] };

export default function LanguagesCard({ repos }: Props): JSX.Element {
  return (
    <motion.div
      className="card w-full rounded-xl border p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="font-bold text-color">Principais Linguagens</h3>
      <div className="mt-4 space-y-3">
        {(() => {
          const counts = repos.reduce<Record<string, number>>((acc, r) => {
            const lang = r.language ?? "Unknown";
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
          }, {});
          const entries = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
          if (entries.length === 0) {
            return <div className="text-color/70">Sem dados</div>;
          }
          return entries.map(([lang, cnt], i) => {
            const pct = Math.min(
              100,
              Math.round((cnt / Math.max(1, repos.length)) * 100)
            );
            return (
              <motion.div
                key={lang}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <div className="mb-1 flex justify-between text-sm">
                  <span>{lang}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-primary/20">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </motion.div>
            );
          });
        })()}
      </div>
    </motion.div>
  );
}
