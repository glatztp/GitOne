import { useEffect, useState, type JSX } from "react";
import { useLocation } from "react-router-dom";

import SearchBar from "./ui/SearchBar";
import TokenModal from "./ui/TokenModal";
import ProfileCard from "./dashboard/ProfileCard";
import LanguagesCard from "./dashboard/LanguagesCard";
import KPIGrid from "./dashboard/KPIGrid";
import ActivityCard from "./dashboard/ActivityCard";
import RepoList from "./dashboard/RepoList";
import type { GitHubRepo, GitHubUser } from "./dashboard/types";

const CACHE_TTL_MS = 1000 * 60 * 5;

export default function Dashboard(): JSX.Element {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(
    Boolean(localStorage.getItem("github_token"))
  );
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [sortMode, setSortMode] = useState<"pushed" | "stars">("pushed");
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

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("user");
    const initial =
      q ?? localStorage.getItem("github_prefill_user") ?? username;
    if (initial) {
      const u = String(initial);
      setUsername(u);
      fetchAndSet(u);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "github_token") setHasToken(Boolean(e.newValue));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleSortToggle() {
    const next = sortMode === "pushed" ? "stars" : "pushed";
    setSortMode(next);
    setRepos((prev) => {
      const copy = [...prev];
      if (next === "stars") {
        copy.sort((a, b) => b.stargazers_count - a.stargazers_count);
      } else {
        copy.sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));
      }
      return copy;
    });
  }

  function handleFilterReset() {
    if (!username) return;
    const cachedKey = `gh_cache:${username.toLowerCase()}`;
    const cached = localStorage.getItem(cachedKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setRepos(parsed.repos || []);
    }
  }

  function handleFilter(v: string) {
    setRepos((prev) => prev.filter((r) => r.name.toLowerCase().includes(v)));
  }

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
        const details = await userRes
          .json()
          .then((j) => j.message || JSON.stringify(j))
          .catch(() => userRes.statusText || String(userRes.status));
        if (userRes.status === 404) throw new Error("Usuário não encontrado.");
        throw new Error(
          `Erro ao buscar usuário: ${userRes.status} - ${details}`
        );
      }

      if (!reposRes.ok) {
        const details = await reposRes
          .json()
          .then((j) => j.message || JSON.stringify(j))
          .catch(() => reposRes.statusText || String(reposRes.status));
        throw new Error(
          `Erro ao buscar repositórios: ${reposRes.status} - ${details}`
        );
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
        description?: string | null;
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
          description: r.description ?? null,
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
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : String(err);
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
    <div className="relative min-h-screen w-full overflow-hidden bg-surface px-6">
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="./logo.png" alt="GitOne Logo" className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-3">
            <SearchBar
              query={query}
              setQuery={setQuery}
              onSearch={(q) => {
                setUsername(q);
                fetchAndSet(q);
              }}
            />
            <button
              onClick={() => setTokenModalOpen(true)}
              title={hasToken ? "Gerenciar token" : "Adicionar token"}
              className={`ml-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                hasToken
                  ? "bg-emerald-500 text-black"
                  : "bg-primary text-background-dark"
              }`}
            >
              {hasToken ? "Token salvo" : "Adicionar token"}
            </button>
            <TokenModal
              open={tokenModalOpen}
              onClose={() => {
                setTokenModalOpen(false);
                setHasToken(Boolean(localStorage.getItem("github_token")));
              }}
            />
          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-6">
              <ProfileCard user={user} username={username} />

              <div className="card w-full rounded-xl border p-6">
                <h3 className="font-bold text-color">Organizações</h3>
                <div className="mt-4 text-sm text-color/70">
                  Nenhuma organização para mostrar.
                </div>
              </div>

              <LanguagesCard repos={repos} />
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="flex flex-col gap-8">
              <KPIGrid
                totalForks={totalForks}
                totalOpenIssues={totalOpenIssues}
                totalStars={totalStars}
                user={user}
              />

              <div className="card rounded-xl border p-6">
                <h3 className="text-lg font-bold text-color">
                  Comparar com Outro Perfil
                </h3>
                <p className="text-sm text-color/70 mt-2">
                  Use a busca acima para carregar outro usuário e comparar
                  manualmente.
                </p>
              </div>

              <ActivityCard repos={repos} loading={loading} error={error} />

              <RepoList
                username={username}
                repos={repos}
                paginatedRepos={paginatedRepos}
                sortMode={sortMode}
                onSortToggle={handleSortToggle}
                onFilterReset={handleFilterReset}
                onFilter={handleFilter}
                safePage={safePage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
