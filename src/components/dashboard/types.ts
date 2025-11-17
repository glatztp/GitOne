export type GitHubRepo = {
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

export type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  location?: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
};
