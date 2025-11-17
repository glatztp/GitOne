import type { JSX } from "react";
import { GitBranch, Bug, ChartLineUp } from "@phosphor-icons/react";
import type { GitHubUser } from "./types";
import { motion } from "framer-motion";

type KPI = { label: string; value: string; icon: JSX.Element };

type Props = {
  totalForks: number;
  totalOpenIssues: number;
  totalStars: number;
  user: GitHubUser | null;
};

export default function KPIGrid({
  totalForks,
  totalOpenIssues,
  totalStars,
  user,
}: Props): JSX.Element {
  const cards: KPI[] = [
    {
      label: "Forks",
      value: totalForks.toLocaleString(),
      icon: <GitBranch size={18} weight="bold" />,
    },
    {
      label: "Issues Abertas",
      value: totalOpenIssues.toLocaleString(),
      icon: <Bug size={18} weight="bold" />,
    },
    {
      label: "Repositórios",
      value: user ? user.public_repos.toString() : "—",
      icon: <GitBranch size={18} weight="bold" />,
    },
    {
      label: "Total de Stars",
      value: totalStars.toLocaleString(),
      icon: <ChartLineUp size={18} weight="bold" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          className="card rounded-xl border p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {c.icon}
            </div>
            <div>
              <p className="text-sm text-color/70">{c.label}</p>
              <p className="text-xl font-bold text-color">{c.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
