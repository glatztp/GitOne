import { useEffect, useState, type JSX } from "react";
import {
  MapPin,
  GitBranch,
  GitCommit,
  ChartLineUp,
  Bug,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";

type GitHubRepo = {
  id: number;
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  updated_at: string;
  private: boolean;
  archived: boolean;
  open_issues_count: number;
  html_url: string;
};

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  location?: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
};

function timeAgo(dateStr: string) {
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s atrás`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m atrás`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h atrás`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d atrás`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}m atrás`;
  const years = Math.floor(months / 12);
  return `${years}y atrás`;
}

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

export default function Dashboard(): JSX.Element {
  const [username, setUsername] = useState(""); 
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(repos.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRepos = repos.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  useEffect(() => {
    fetchAndSet(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAndSet(userToFetch: string) {
    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    setCurrentPage(1);

    try {
      const cachedKey = `gh_cache:${userToFetch.toLowerCase()}`;
      const cached = localStorage.getItem(cachedKey);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          ts: number;
          user?: GitHubUser;
          repos?: GitHubRepo[];
        };
        if (
          Date.now() - parsed.ts < CACHE_TTL_MS &&
          parsed.user &&
          parsed.repos
        ) {
          setUser(parsed.user);
          setRepos(parsed.repos);
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem("github_token") || undefined;
      const headers: Record<string, string> = token
        ? { Authorization: `token ${token}` }
        : {};

      const [userRes, reposRes] = await Promise.all([
        fetch(
          `https://api.github.com/users/${encodeURIComponent(userToFetch)}`,
          {
            headers,
          }
        ),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(
            userToFetch
          )}/repos?per_page=100&sort=pushed`,
          { headers }
        ),
      ]);

      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error("Usuário não encontrado.");
        throw new Error(`Erro ao buscar usuário: ${userRes.status}`);
      }
      if (!reposRes.ok) {
        throw new Error(`Erro ao buscar repositórios: ${reposRes.status}`);
      }

      const userJson = await userRes.json();
      const reposJson = await reposRes.json();

      const userParsed: GitHubUser = {
        login: userJson.login,
        name: userJson.name,
        avatar_url: userJson.avatar_url,
        location: userJson.location,
        followers: userJson.followers,
        following: userJson.following,
        public_repos: userJson.public_repos,
        html_url: userJson.html_url,
      };

      type GitHubRepoAPI = {
        id: number;
        name: string;
        stargazers_count: number;
        forks_count: number;
        language: string | null;
        pushed_at: string;
        updated_at: string;
        private: boolean;
        archived: boolean;
        open_issues_count: number;
        html_url: string;
      };

      const reposParsed: GitHubRepo[] = (reposJson as GitHubRepoAPI[]).map(
        (r) => ({
          id: r.id,
          name: r.name,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          language: r.language,
          pushed_at: r.pushed_at,
          updated_at: r.updated_at,
          private: r.private,
          archived: r.archived,
          open_issues_count: r.open_issues_count,
          html_url: r.html_url,
        })
      );

      setUser(userParsed);
      setRepos(reposParsed);

      localStorage.setItem(
        cachedKey,
        JSON.stringify({ ts: Date.now(), user: userParsed, repos: reposParsed })
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : typeof err === "string" ? err : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const totalOpenIssues = repos.reduce(
    (s, r) => s + (r.open_issues_count || 0),
    0
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black home-force-white px-24">
      <div className="relative z-10 mx-auto">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="./logo.png" alt="GitOne Logo" className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-color/50">
                <MagnifyingGlassIcon size={16} className="text-color/50" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    setUsername(query.trim());
                    fetchAndSet(query.trim());
                  }
                }}
                className="rounded-md border bg-surface-dark/50 py-2 pl-10 pr-4 text-sm text-color placeholder-color/50 focus:border-primary focus:ring-primary"
                placeholder="Buscar usuário do GitHub e pressionar Enter..."
                aria-label="Buscar usuário"
              />
            </div>
            <button
              onClick={() => {
                if (!query.trim()) return;
                setUsername(query.trim());
                fetchAndSet(query.trim());
              }}
              className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold  border"
            >
              <ArrowRightIcon size={16} />
              Buscar
            </button>
          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-6">
              <div className="card w-full rounded-xl border p-6 text-center">
                <img
                  className="mx-auto h-24 w-24 rounded-full"
                  src={user?.avatar_url ?? "https://via.placeholder.com/96"}
                />
                <h2 className="mt-4 text-2xl font-bold text-color">
                  {user?.name ?? username}
                </h2>
                <p className="text-primary">@{user?.login ?? username}</p>
                <p className="mt-2 text-sm text-color/70">
                  {user ? (
                    <>
                      Perfil público do GitHub —{" "}
                      <a
                        className="text-primary underline"
                        href={user.html_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ver no GitHub
                      </a>
                    </>
                  ) : (
                    <>Busque um usuário para ver detalhes</>
                  )}
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-color/70">
                  <MapPin size={18} className="text-color/70" />
                  <span>{user?.location ?? "—"}</span>
                </div>

                <div className="mt-4 flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-color">
                      {user?.followers ?? "—"}
                    </p>
                    <p className="text-xs text-color/70">Seguidores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-color">
                      {user?.following ?? "—"}
                    </p>
                    <p className="text-xs text-color/70">Seguindo</p>
                  </div>
                </div>
              </div>

              <div className="card w-full rounded-xl border p-6">
                <h3 className="font-bold text-color">Organizações</h3>
                <div className="mt-4 text-sm text-color/70">
                  Nenhuma organização para mostrar.
                </div>
              </div>

              <div className="card w-full rounded-xl border p-6">
                <h3 className="font-bold text-color">Principais Linguagens</h3>
                <div className="mt-4 space-y-3">
                  {(() => {
                    const counts = repos.reduce<Record<string, number>>(
                      (acc, r) => {
                        const lang = r.language ?? "Unknown";
                        acc[lang] = (acc[lang] || 0) + 1;
                        return acc;
                      },
                      {}
                    );
                    const entries = Object.entries(counts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3);
                    if (entries.length === 0) {
                      return <div className="text-color/70">Sem dados</div>;
                    }
                    return entries.map(([lang, cnt]) => {
                      const pct = Math.min(
                        100,
                        Math.round((cnt / Math.max(1, repos.length)) * 100)
                      );
                      return (
                        <div key={lang}>
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
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="flex flex-col gap-8">
              {/* KPI cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
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
                ].map((c) => (
                  <div key={c.label} className="card rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {c.icon}
                      </div>
                      <div>
                        <p className="text-sm text-color/70">{c.label}</p>
                        <p className="text-xl font-bold text-color">
                          {c.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card rounded-xl border p-6">
                <h3 className="text-lg font-bold text-color">
                  Comparar com Outro Perfil
                </h3>
                <p className="text-sm text-color/70 mt-2">
                  Use a busca acima para carregar outro usuário e comparar
                  manualmente.
                </p>
              </div>

              <div className="card rounded-xl border p-6">
                <h3 className="text-lg font-bold text-color">
                  Atividade Recente
                </h3>
                <div className="mt-4">
                  {loading && (
                    <div className="text-color/70">Carregando atividade...</div>
                  )}
                  {error && <div className="text-sm text-red-400">{error}</div>}
                  {!loading && !error && repos.length === 0 && (
                    <div className="text-color/70">
                      Nenhum repositório encontrado.
                    </div>
                  )}

                  {!loading && repos.length > 0 && (
                    <ul
                      className="-mb-8"
                      role="list"
                      aria-label="Atividade recente"
                    >
                      {repos.slice(0, 6).map((r) => (
                        <li key={r.id}>
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="card rounded-xl border">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-dark p-4 md:p-6">
                  <h3 className="text-lg font-bold text-color">Repositórios</h3>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-color/50">
                        <MagnifyingGlassIcon
                          size={16}
                          className="text-color/50"
                        />
                      </span>
                      <input
                        className="w-full rounded-md border-border-dark bg-surface-dark/50 py-2 pl-10 pr-4 text-sm text-color placeholder-color/50 focus:border-primary focus:ring-primary sm:w-auto"
                        placeholder="Filtrar repositórios por nome..."
                        type="text"
                        aria-label="Filtrar repositórios"
                        onChange={(e) => {
                          const v = e.target.value.toLowerCase();
                          if (!v) {
                            // reset by refetching cached
                            const cachedKey = `gh_cache:${username.toLowerCase()}`;
                            const cached = localStorage.getItem(cachedKey);
                            if (cached) {
                              const parsed = JSON.parse(cached);
                              setRepos(parsed.repos || []);
                            }
                            return;
                          }
                          setRepos((prev) =>
                            prev.filter((r) => r.name.toLowerCase().includes(v))
                          );
                        }}
                      />
                    </div>

                    <button className="flex items-center gap-2 rounded-md border border-border-dark bg-surface-dark/50 px-3 py-2 text-sm text-color/90 hover:border-primary/50">
                      <FunnelSimpleIcon size={16} className="text-color/90" />
                      <span>Ordenar</span>
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
                    {paginatedRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="grid grid-cols-12 items-center gap-4 p-4 hover:bg-primary/5"
                      >
                        <span className="col-span-12 font-semibold text-color md:col-span-4">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {repo.name}
                          </a>
                        </span>
                        <div className="col-span-4 flex items-center gap-1 text-sm text-color/70 md:col-span-2">
                          <span className="material-symbols-outlined text-base">
                            star
                          </span>{" "}
                          {repo.stargazers_count}
                        </div>
                        <div className="col-span-4 flex items-center gap-1 text-sm text-color/70 md:col-span-2">
                          <span className="material-symbols-outlined text-base">
                            call_split
                          </span>{" "}
                          {repo.forks_count}
                        </div>
                        <div className="col-span-4 flex items-center gap-1 text-sm text-color/70 md:col-span-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              repo.language === "JavaScript"
                                ? "bg-primary"
                                : repo.language === "TypeScript"
                                ? "bg-[#3178c6]"
                                : "bg-[#3572A5]"
                            }`}
                          />
                          {repo.language ?? "—"}
                        </div>
                        <span className="col-span-12 text-xs text-color/70 md:col-span-2 md:text-right">
                          {timeAgo(repo.pushed_at)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={safePage === 1}
                        className="px-3 py-1 rounded border bg-surface-dark/50 text-sm disabled:opacity-50"
                      >
                        Anterior
                      </button>

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={safePage === totalPages}
                        className="px-3 py-1 rounded border bg-surface-dark/50 text-sm disabled:opacity-50"
                      >
                        Próximo
                      </button>
                    </div>

                    <div className="text-sm text-color/70">
                      Página {safePage} de {totalPages}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
