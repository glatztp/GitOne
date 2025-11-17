import { useEffect, useRef, useState, type JSX } from "react";
import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TokenModal({
  open,
  onClose,
}: Props): JSX.Element | null {
  const [token, setToken] = useState<string>(
    () => localStorage.getItem("github_token") || ""
  );
  const [input, setInput] = useState<string>("");
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Defer state updates to avoid synchronous setState inside effect
    const t = window.setTimeout(() => {
      setInput("");
      setReveal(false);
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = prev || "";
      clearTimeout(t);
    };
  }, [open]);

  if (!open) return null;

  function save() {
    const v = input.trim();
    if (!v) return;
    localStorage.setItem("github_token", v);
    setToken(v);
    setInput("");
    onClose();
  }

  function clearToken() {
    localStorage.removeItem("github_token");
    setToken("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Gerenciar GitHub Token"
        className="relative z-10 w-full max-w-md transform overflow-visible rounded-2xl border border-zinc-800 bg-linear-to-b from-zinc-900/90 to-zinc-900/80 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.14 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Token do GitHub
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Cole um Personal Access Token (PAT) para aumentar o limite de
              requisições. Não compartilhe este token.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md px-2 py-1 text-zinc-300 hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-zinc-300">Token atual</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={token ? (reveal ? token : `${token.slice(0, 6)}...`) : ""}
              placeholder="Nenhum token salvo"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200"
            />
            <button
              onClick={() => setReveal((s) => !s)}
              className="px-3 py-2 rounded-md bg-zinc-800 text-sm text-zinc-200"
            >
              {reveal ? "Ocultar" : "Mostrar"}
            </button>
            <button
              onClick={clearToken}
              disabled={!token}
              className="px-3 py-2 rounded-md bg-red-600 text-sm text-white disabled:opacity-50"
            >
              Remover
            </button>
          </div>

          <label className="block text-sm text-zinc-300 mt-4">Novo Token</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ghp_xxx..."
              className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200"
            />
            <button
              onClick={save}
              disabled={input.trim().length === 0}
              className="px-3 py-2 rounded-md bg-emerald-500 text-sm text-black disabled:opacity-50"
            >
              Salvar
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            Dica: para uso local apenas. Em produção, armazene tokens com
            segurança (backend, cofre de segredos).
          </p>
        </div>
      </motion.div>
    </div>
  );
}
