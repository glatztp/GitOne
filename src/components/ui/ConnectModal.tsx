import { useEffect, useRef, useState, type JSX } from "react";
import { motion } from "framer-motion";

type Suggestion = {
  login: string;
  avatar_url?: string;
  html_url?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (username: string) => void;
};

export default function ConnectModal({
  open,
  onClose,
  onConfirm,
}: Props): JSX.Element | null {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prev || "";
      clearTimeout(t);
    };
  }, [open]);

  function confirmAndClose(name?: string) {
    const username = (name ?? value).trim();
    if (!username) return;
    onConfirm(username);
    setValue("");
    setSuggestions([]);
    setActiveIndex(-1);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    const q = value.trim();
    if (q.length < 2) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setSuggestions([]);
      setError(null);
      return;
    }

    setSuggestions(null); 
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(
          q
        )}+in:login&per_page=6`,
        { signal: ac.signal }
      )
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const itemsRaw = Array.isArray((data as Record<string, unknown>).items)
            ? ((data as Record<string, unknown>).items as unknown[])
            : [];

          function isGitHubUser(u: unknown): u is Suggestion {
            return (
              typeof u === "object" &&
              u !== null &&
              typeof (u as Record<string, unknown>).login === "string"
            );
          }

          const mapped: Suggestion[] = itemsRaw
            .filter(isGitHubUser)
            .map((it) => ({
              login: it.login,
              avatar_url: it.avatar_url,
              html_url: it.html_url,
            }));

          setSuggestions(mapped);
          setActiveIndex(-1);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setError("Erro ao buscar sugestões");
          setSuggestions([]);
        })
        .finally(() => {
          abortRef.current = null;
        });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, open]);

  if (!open) return null;

  const isLoading = suggestions === null;
  const hasResults = Array.isArray(suggestions) && suggestions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Conectar com GitHub"
        className="relative z-10 w-full max-w-lg transform overflow-visible rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/80 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.14 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Conectar com GitHub
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Digite o usuário (min: 2 caracteres)
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

        <div className="mt-4 relative">
          <div className="flex items-center gap-3 rounded-lg bg-zinc-800 px-3 py-2">
            <svg
              className="h-5 w-5 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>

            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (activeIndex >= 0 && hasResults) {
                    confirmAndClose(suggestions![activeIndex].login);
                  } else {
                    confirmAndClose();
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIndex((s) =>
                    hasResults ? Math.min(s + 1, suggestions!.length - 1) : -1
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIndex((s) =>
                    hasResults ? Math.max(s - 1, 0) : -1
                  );
                } else if (e.key === "Escape") {
                  setSuggestions([]);
                  setActiveIndex(-1);
                }
              }}
              placeholder="ex: octocat"
              className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
              aria-label="Nome de usuário do GitHub"
              aria-autocomplete="list"
              aria-controls="github-suggestions-list"
              aria-activedescendant={
                activeIndex >= 0 ? `sugg-${activeIndex}` : undefined
              }
            />
          </div>

          <div className="absolute left-0 right-0 z-50 mt-2">
            <motion.ul
              id="github-suggestions-list"
              role="listbox"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: isLoading || hasResults || error ? 1 : 0, y: 0 }}
              transition={{ duration: 0.12 }}
              className={`max-h-64 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-xl backdrop-blur-md ${
                isLoading || hasResults || error ? "block" : "hidden"
              }`}
            >
              {isLoading && (
                <li className="px-4 py-3 text-sm text-zinc-400">Buscando...</li>
              )}
              {error && (
                <li className="px-4 py-3 text-sm text-red-400">{error}</li>
              )}
              {!isLoading && !error && !hasResults && value.trim().length >= 2 && (
                <li className="px-4 py-3 text-sm text-zinc-400">
                  Nenhuma sugestão
                </li>
              )}

              {hasResults &&
                suggestions!.map((s, i) => (
                  <motion.li
                    id={`sugg-${i}`}
                    key={s.login}
                    role="option"
                    aria-selected={activeIndex === i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.12 }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      confirmAndClose(s.login);
                    }}
                    className={`flex items-center justify-between gap-3 px-3 py-3 hover:bg-zinc-800/50 transition ${
                      activeIndex === i ? "bg-zinc-800/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {s.avatar_url ? (
                        <img
                          src={s.avatar_url}
                          alt={`${s.login} avatar`}
                          className="h-8 w-8 rounded-full shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                          {s.login.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="truncate font-medium text-white text-left">
                          {s.login}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">
                          {s.html_url ?? `github.com/${s.login}`}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          confirmAndClose(s.login);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-black shadow-sm hover:brightness-95"
                      >
                        Selecionar
                      </button>
                    </div>
                  </motion.li>
                ))}
            </motion.ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setValue("");
              setSuggestions([]);
              setActiveIndex(-1);
            }}
            className="px-4 py-2 rounded-lg border bg-transparent text-zinc-300 hover:bg-zinc-800/40"
          >
            Limpar
          </button>

          <button
            onClick={() => confirmAndClose()}
            disabled={value.trim().length === 0}
            className={`px-4 py-2 rounded-lg text-black shadow-sm ${
              value.trim().length === 0
                ? "bg-zinc-600/40 cursor-not-allowed"
                : "bg-emerald-500 hover:brightness-95"
            }`}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
