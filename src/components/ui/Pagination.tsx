import type { JSX } from "react";

type Props = {
  safePage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

import { motion } from "framer-motion";
export default function Pagination({
  safePage,
  totalPages,
  onPrev,
  onNext,
}: Props): JSX.Element {
  return (
    <motion.div
      className="flex items-center justify-between px-4 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={safePage === 1}
          className="px-3 py-1 rounded border bg-surface-dark/50 text-sm disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={safePage === totalPages}
          className="px-3 py-1 rounded border bg-surface-dark/50 text-sm disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
      <div className="text-sm text-color/70">
        Página {safePage} de {totalPages}
      </div>
    </motion.div>
  );
}
